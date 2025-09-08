const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.setAdminClaim = functions.auth.user().onCreate(async (user) => {
  if (user.email === "felixhoooo@gmail.com") {
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  }
});
