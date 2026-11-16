module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {},
      desktop: {
        cmake: 'desktop',
        hostComponents: [
          { name: 'NitroFixtureView', nativeSurface: true, cpp: true },
        ],
      },
    },
  },
};
