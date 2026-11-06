rn_gpui_module::include_specs!();

use pgp::composed::{
    ArmorOptions, Deserializable, EncryptionCaps, KeyType, Message, MessageBuilder,
    SecretKeyParamsBuilder, SignedPublicKey, SignedSecretKey, SubkeyParamsBuilder,
};
use pgp::crypto::ecc_curve::ECCCurve;
use pgp::crypto::sym::SymmetricKeyAlgorithm;
use pgp::types::{KeyDetails, Password};
use rand::thread_rng;
use rn_gpui_module::{ModuleError, Value};

pub struct OpenPGP;

fn failure(error: impl std::fmt::Display) -> ModuleError {
    ModuleError::with_code("E_OPENPGP", error.to_string())
}

fn option_string(options: &Value, name: &str) -> String {
    match options {
        Value::Object(fields) => fields
            .iter()
            .find_map(|(key, value)| match value {
                Value::String(text) if key == name => Some(text.clone()),
                _ => None,
            })
            .unwrap_or_default(),
        _ => String::new(),
    }
}

impl NativeOpenPGPSpec for OpenPGP {
    fn new(_events: NativeOpenPGPEvents) -> Self {
        Self
    }

    async fn generate(&self, options: Value) -> Result<Value, ModuleError> {
        let name = option_string(&options, "name");
        let email = option_string(&options, "email");
        let mut encryption = SubkeyParamsBuilder::default();
        encryption
            .key_type(KeyType::ECDH(ECCCurve::Curve25519Legacy))
            .can_sign(false)
            .can_encrypt(EncryptionCaps::All)
            .can_authenticate(false);
        let mut params = SecretKeyParamsBuilder::default();
        params
            .key_type(KeyType::Ed25519Legacy)
            .can_certify(true)
            .can_sign(true)
            .can_encrypt(EncryptionCaps::None)
            .primary_user_id(format!("{name} <{email}>"))
            .subkeys(vec![encryption.build().map_err(failure)?]);
        let secret = params
            .build()
            .map_err(failure)?
            .generate(thread_rng())
            .map_err(failure)?;
        let public = SignedPublicKey::from(secret.clone());
        Ok(Value::object([
            (
                "publicKey",
                Value::String(
                    public
                        .to_armored_string(ArmorOptions::default())
                        .map_err(failure)?,
                ),
            ),
            (
                "privateKey",
                Value::String(
                    secret
                        .to_armored_string(ArmorOptions::default())
                        .map_err(failure)?,
                ),
            ),
        ]))
    }

    async fn encrypt(&self, message: String, public_key: String) -> Result<String, ModuleError> {
        let (key, _) = SignedPublicKey::from_string(&public_key).map_err(failure)?;
        let subkey = key
            .public_subkeys
            .iter()
            .find(|subkey| subkey.algorithm().can_encrypt())
            .ok_or_else(|| ModuleError::new("the public key has no encryption key"))?;
        let mut builder = MessageBuilder::from_bytes("", message.into_bytes())
            .seipd_v1(thread_rng(), SymmetricKeyAlgorithm::AES256);
        builder
            .encrypt_to_key(thread_rng(), subkey)
            .map_err(failure)?;
        builder
            .to_armored_string(thread_rng(), ArmorOptions::default())
            .map_err(failure)
    }

    async fn decrypt(
        &self,
        message: String,
        private_key: String,
        passphrase: String,
    ) -> Result<String, ModuleError> {
        let (key, _) = SignedSecretKey::from_string(&private_key).map_err(failure)?;
        let (message, _) = Message::from_string(&message).map_err(failure)?;
        let password: Password = passphrase.as_str().into();
        let mut decrypted = message.decrypt(&password, &key).map_err(failure)?;
        if decrypted.is_compressed() {
            decrypted = decrypted.decompress().map_err(failure)?;
        }
        String::from_utf8(decrypted.as_data_vec().map_err(failure)?).map_err(failure)
    }
}

pub fn rn_gpui_register() {
    rn_gpui_module::register(native_open_pgp_module::<OpenPGP>());
}
