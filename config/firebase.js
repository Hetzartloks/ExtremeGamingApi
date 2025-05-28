// config/firebase.js
const admin = require('firebase-admin');
// El JSON está en la misma carpeta config/
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin.firestore();
