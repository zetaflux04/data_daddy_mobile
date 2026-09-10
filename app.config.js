module.exports = ({ config }) => {
  // In Expo Go developer mode, Expo Go automatically renders `name` directly under the icon card on its loading screen.
  // By providing a single space ' ' in development, Expo Go shows only the logo without any text underneath.
  // When building standalone APK / production bundles (EAS Build), it retains the proper app name 'Metafy'.
  const isProductionBuild = process.env.EAS_BUILD === 'true' || process.env.APP_ENV === 'production';

  return {
    ...config,
    name: isProductionBuild ? 'Metafy' : ' ',
  };
};
