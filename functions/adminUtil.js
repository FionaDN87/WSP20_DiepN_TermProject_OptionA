var admin = require("firebase-admin");

var serviceAccount = require("./diepn-wsp20-firebase-adminsdk-39m6c-8b83a9963b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diepn-wsp20.firebaseio.com"
});