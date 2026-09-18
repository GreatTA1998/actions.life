const fs = require('fs');
const path = require('path');

const ANDROID_PACKAGE = 'life.actions.expo';
const ANDROID_SERVICES_FILE = 'google-services.json';
const ANDROID_SERVICES_PATH = './google-services.json';

function resolveAndroidServices(root = __dirname) {
  return path.join(root, ANDROID_SERVICES_FILE);
}

/** Firebase `oauth_client.client_type` 1 is Android. */
function readAndroidClientId(json) {
  const clients = Array.isArray(json?.client) ? json.client : [];
  const forPackage = clients.filter(
    (client) => client?.client_info?.android_client_info?.package_name === ANDROID_PACKAGE,
  );
  const search = forPackage.length > 0 ? forPackage : clients;
  for (const client of search) {
    const oauth = Array.isArray(client?.oauth_client) ? client.oauth_client : [];
    const android = oauth.find((entry) => entry?.client_type === 1 && entry.client_id);
    if (android?.client_id) return String(android.client_id);
  }
  for (const client of search) {
    if (!client?.client_info?.android_client_info) continue;
    const first = (client.oauth_client ?? []).find((entry) => entry?.client_id);
    if (first?.client_id) return String(first.client_id);
  }
  return '';
}

/**
 * Apply `android.googleServicesFile` only when the json exists so a clean
 * prebuild does not fail while Android is still unregistered. A later commit
 * only needs to drop `google-services.json`.
 */
function applyAndroidGoogleServices(expo, root = __dirname) {
  if (!expo.android) expo.android = {};
  if (!expo.extra) expo.extra = {};
  const file = resolveAndroidServices(root);
  if (!fs.existsSync(file)) {
    delete expo.android.googleServicesFile;
    return { present: false, clientId: '' };
  }
  expo.android.googleServicesFile = ANDROID_SERVICES_PATH;
  let clientId = '';
  try {
    clientId = readAndroidClientId(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    clientId = '';
  }
  if (clientId) expo.extra.googleAndroidClientId = clientId;
  return { present: true, clientId };
}

module.exports = {
  ANDROID_PACKAGE,
  ANDROID_SERVICES_FILE,
  ANDROID_SERVICES_PATH,
  readAndroidClientId,
  applyAndroidGoogleServices,
  resolveAndroidServices,
};
