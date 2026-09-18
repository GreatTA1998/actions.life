import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { readAndroidClientId } from '../../googleServicesAndroid.js';

const root = resolve(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);

test('Android google-services path is hooked; file is optional until Elton drops it', () => {
  const app = JSON.parse(readFileSync(resolve(root, 'app.json'), 'utf8')) as {
    expo: {
      android: { package: string; googleServicesFile?: string };
      extra: { googleAndroidClientId: string };
    };
  };
  assert.equal(app.expo.android.package, 'life.actions.expo');
  assert.equal(app.expo.android.googleServicesFile, './google-services.json');

  const jsonPath = resolve(root, 'google-services.json');
  const config = require(resolve(root, 'app.config.js')) as {
    android: { googleServicesFile?: string };
    extra: { googleAndroidClientId?: string };
  };

  if (existsSync(jsonPath)) {
    const json = JSON.parse(readFileSync(jsonPath, 'utf8'));
    assert.equal(config.android.googleServicesFile, './google-services.json');
    const clientId = readAndroidClientId(json);
    assert.ok(clientId, 'expected oauth_client type 1 (Android) client_id');
    assert.equal(config.extra.googleAndroidClientId, clientId);
  } else {
    assert.equal(config.android.googleServicesFile, undefined);
    assert.equal(app.expo.extra.googleAndroidClientId, '');
  }
});

test('readAndroidClientId prefers oauth_client type 1 for life.actions.expo', () => {
  const clientId = readAndroidClientId({
    client: [
      {
        client_info: { android_client_info: { package_name: 'life.actions.expo' } },
        oauth_client: [
          { client_id: 'web.apps.googleusercontent.com', client_type: 3 },
          { client_id: 'android.apps.googleusercontent.com', client_type: 1 },
        ],
      },
    ],
  });
  assert.equal(clientId, 'android.apps.googleusercontent.com');
});
