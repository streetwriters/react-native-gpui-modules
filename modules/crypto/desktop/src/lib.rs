rn_gpui_module::include_specs!();

use aes::{Aes128, Aes192, Aes256};
use aes_gcm::aead::{Aead, KeyInit, Payload};
use aes_gcm::AesGcm;
use hmac::Hmac;
use rn_gpui_module::{ArrayBuffer, ModuleError};
use sha1::Sha1;
use sha2::{Digest, Sha256, Sha384, Sha512};

pub struct Subtle;

fn failure(code: &str, message: impl ToString) -> ModuleError {
    ModuleError::with_code(code, message.to_string())
}

fn operation(message: impl ToString) -> ModuleError {
    failure("ERR_CRYPTO_OPERATION", message)
}

fn unsupported(message: impl ToString) -> ModuleError {
    failure("ERR_CRYPTO_UNSUPPORTED", message)
}

fn digest(hash: &str, data: &[u8]) -> Result<Vec<u8>, ModuleError> {
    Ok(match hash {
        "SHA-1" => Sha1::digest(data).to_vec(),
        "SHA-256" => Sha256::digest(data).to_vec(),
        "SHA-384" => Sha384::digest(data).to_vec(),
        "SHA-512" => Sha512::digest(data).to_vec(),
        other => return Err(unsupported(format!("hash {other}"))),
    })
}

type Gcm<C> = AesGcm<C, aes_gcm::aead::consts::U12>;

fn gcm(
    encrypt: bool,
    key: &[u8],
    iv: &[u8],
    aad: &[u8],
    data: &[u8],
) -> Result<Vec<u8>, ModuleError> {
    if iv.len() != 12 {
        return Err(unsupported("AES-GCM takes a 12 byte iv"));
    }
    let nonce = aes_gcm::Nonce::from_slice(iv);
    let payload = Payload { msg: data, aad };
    macro_rules! run {
        ($cipher:ty) => {{
            let cipher = Gcm::<$cipher>::new_from_slice(key).map_err(operation)?;
            if encrypt {
                cipher.encrypt(nonce, payload)
            } else {
                cipher.decrypt(nonce, payload)
            }
        }};
    }
    match key.len() {
        16 => run!(Aes128),
        24 => run!(Aes192),
        32 => run!(Aes256),
        _ => return Err(operation("bad AES key length")),
    }
    .map_err(|_| operation("AES-GCM failed: the data or the tag does not match the key"))
}

fn kw(wrap: bool, key: &[u8], data: &[u8]) -> Result<Vec<u8>, ModuleError> {
    macro_rules! run {
        ($cipher:ty) => {{
            let kek = aes_kw::Kek::<$cipher>::try_from(key).map_err(operation)?;
            if wrap {
                kek.wrap_vec(data)
            } else {
                kek.unwrap_vec(data)
            }
        }};
    }
    match key.len() {
        16 => run!(Aes128),
        24 => run!(Aes192),
        32 => run!(Aes256),
        _ => return Err(operation("bad AES key length")),
    }
    .map_err(|_| operation("AES-KW failed: the data is not a key wrapped by this key"))
}

fn pbkdf2(
    hash: &str,
    password: &[u8],
    salt: &[u8],
    iterations: u32,
    length: usize,
) -> Result<Vec<u8>, ModuleError> {
    let mut out = vec![0u8; length];
    match hash {
        "SHA-1" => pbkdf2::pbkdf2::<Hmac<Sha1>>(password, salt, iterations, &mut out),
        "SHA-256" => pbkdf2::pbkdf2::<Hmac<Sha256>>(password, salt, iterations, &mut out),
        "SHA-384" => pbkdf2::pbkdf2::<Hmac<Sha384>>(password, salt, iterations, &mut out),
        "SHA-512" => pbkdf2::pbkdf2::<Hmac<Sha512>>(password, salt, iterations, &mut out),
        other => return Err(unsupported(format!("hash {other}"))),
    }
    .map_err(operation)?;
    Ok(out)
}

fn hkdf(
    hash: &str,
    key: &[u8],
    salt: &[u8],
    info: &[u8],
    length: usize,
) -> Result<Vec<u8>, ModuleError> {
    let mut out = vec![0u8; length];
    macro_rules! run {
        ($hash:ty) => {
            hkdf::Hkdf::<$hash>::new(Some(salt), key)
                .expand(info, &mut out)
                .map_err(|_| operation("HKDF cannot give that many bytes"))?
        };
    }
    match hash {
        "SHA-1" => run!(Sha1),
        "SHA-256" => run!(Sha256),
        "SHA-384" => run!(Sha384),
        "SHA-512" => run!(Sha512),
        other => return Err(unsupported(format!("hash {other}"))),
    }
    Ok(out)
}

impl NativeSubtleSpec for Subtle {
    fn new(_events: NativeSubtleEvents) -> Self {
        Self
    }

    async fn digest(&self, hash: String, data: ArrayBuffer) -> Result<ArrayBuffer, ModuleError> {
        digest(&hash, &data).map(ArrayBuffer::from)
    }

    async fn aes_gcm(
        &self,
        encrypt: bool,
        key: ArrayBuffer,
        iv: ArrayBuffer,
        additional_data: ArrayBuffer,
        data: ArrayBuffer,
    ) -> Result<ArrayBuffer, ModuleError> {
        gcm(encrypt, &key, &iv, &additional_data, &data).map(ArrayBuffer::from)
    }

    async fn aes_kw(
        &self,
        wrap: bool,
        key: ArrayBuffer,
        data: ArrayBuffer,
    ) -> Result<ArrayBuffer, ModuleError> {
        kw(wrap, &key, &data).map(ArrayBuffer::from)
    }

    async fn pbkdf2(
        &self,
        hash: String,
        password: ArrayBuffer,
        salt: ArrayBuffer,
        iterations: f64,
        length: f64,
    ) -> Result<ArrayBuffer, ModuleError> {
        pbkdf2(&hash, &password, &salt, iterations as u32, length as usize).map(ArrayBuffer::from)
    }

    async fn hkdf(
        &self,
        hash: String,
        key: ArrayBuffer,
        salt: ArrayBuffer,
        info: ArrayBuffer,
        length: f64,
    ) -> Result<ArrayBuffer, ModuleError> {
        hkdf(&hash, &key, &salt, &info, length as usize).map(ArrayBuffer::from)
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_subtle_module::<Subtle>());
}
