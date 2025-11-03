const admin = require('firebase-admin');

admin.initializeApp()
exports.firebase = admin.app()