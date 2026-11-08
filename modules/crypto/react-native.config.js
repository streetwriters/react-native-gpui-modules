module.exports = {
  dependency: {
    platforms: {
      desktop: {
        cmake: 'desktop',
        cppProvider: 'create_crypto_module',
        cppSpecs: ['NativeCrypto.ts'],
        crate: 'rn-gpui-crypto',
      },
    },
  },
};
