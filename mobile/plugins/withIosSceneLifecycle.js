const {
  withAppDelegate,
  withInfoPlist,
  IOSConfig,
  createRunOncePlugin,
} = require('expo/config-plugins');

const SCENE_DELEGATE = `import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // iOS 27 requires a UIWindowSceneDelegate. ExpoAppSceneDelegate creates the
  // window and starts React Native. Keep this file as the plugin extension point.
}
`;

function withSceneInfoPlist(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') return cfg;
    let src = cfg.modResults.contents;
    if (src.includes('actions-life-uiscene')) return cfg;

    src = src.replace(
      'class AppDelegate: ExpoAppDelegate {',
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
    );

    const startBlock =
      /#if os\(iOS\) \|\| os\(tvOS\)[\s\S]*?window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?factory\.startReactNative\([\s\S]*?\)\s*#endif/;
    if (startBlock.test(src)) {
      src = src.replace(
        startBlock,
        `// actions-life-uiscene: window + RN start live in SceneDelegate (iOS 27 UIScene lifecycle).`,
      );
    } else if (!src.includes('actions-life-uiscene')) {
      src = src.replace(
        'return super.application(application, didFinishLaunchingWithOptions: launchOptions)',
        `// actions-life-uiscene: window + RN start live in SceneDelegate (iOS 27 UIScene lifecycle).
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)`,
      );
    }

    cfg.modResults.contents = src;
    return cfg;
  });
}

function withIosSceneLifecycle(config) {
  config = IOSConfig.XcodeProjectFile.withBuildSourceFile(config, {
    filePath: 'SceneDelegate.swift',
    contents: SCENE_DELEGATE,
    overwrite: true,
  });
  config = withSceneInfoPlist(config);
  config = withSceneAppDelegate(config);
  return config;
}

module.exports = createRunOncePlugin(withIosSceneLifecycle, 'with-ios-scene-lifecycle', '1.0.0');
