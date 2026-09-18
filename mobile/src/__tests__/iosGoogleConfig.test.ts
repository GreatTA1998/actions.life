import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { googleAuthConfig, googleNativeConfigPresent } from '../services/firebase';

const root = resolve(import.meta.dirname, '../..');

test('iOS Firebase plist and Expo extra match the registered app', () => {
  const app = JSON.parse(readFileSync(resolve(root, 'app.json'), 'utf8')) as {
    expo: {
      ios: { googleServicesFile?: string; bundleIdentifier: string };
      extra: { googleIosClientId: string; googleAndroidClientId: string };
      plugins: unknown[];
    };
  };
  const plist = readFileSync(resolve(root, 'GoogleService-Info.plist'), 'utf8');

  assert.equal(app.expo.ios.bundleIdentifier, 'life.actions.expo');
  assert.equal(app.expo.ios.googleServicesFile, './GoogleService-Info.plist');
  assert.match(plist, /<string>life\.actions\.expo<\/string>/);
  assert.match(plist, /<string>project-y-2a061<\/string>/);
  assert.match(plist, /<string>1:132745397287:ios:8d607ef7be8e4d40e73a02<\/string>/);

  const iosClientId = '132745397287-t45us42dolp1ml7vgklfc36p69pue0dg.apps.googleusercontent.com';
  const reversed = 'com.googleusercontent.apps.132745397287-t45us42dolp1ml7vgklfc36p69pue0dg';
  assert.equal(app.expo.extra.googleIosClientId, iosClientId);
  assert.equal(app.expo.extra.googleAndroidClientId, '');
  assert.equal(googleAuthConfig.iosClientId, iosClientId);
  assert.equal(googleNativeConfigPresent(), true);

  const googlePlugin = app.expo.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === '@react-native-google-signin/google-signin',
  ) as [string, { iosUrlScheme: string }];
  assert.equal(googlePlugin[1].iosUrlScheme, reversed);
});

test('native Google redirect is the app scheme, not production auth/callback', () => {
  const auth = readFileSync(resolve(root, 'src/services/authSession.ts'), 'utf8');
  assert.match(auth, /scheme: 'actionslife'/);
  assert.match(auth, /path: 'auth'/);
  assert.doesNotMatch(auth, /https:\/\/actions\.life\/auth\/callback/);
});
