const { expo } = require('./app.json');
const { applyAndroidGoogleServices } = require('./googleServicesAndroid');

const config = JSON.parse(JSON.stringify(expo));
applyAndroidGoogleServices(config);

module.exports = config;
