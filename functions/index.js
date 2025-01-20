/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");


const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.notifyBinFull = functions.database.ref("/bin/status").onUpdate((change, context) => {
  const status = change.after.val();

  if (status === "Full") {
    const message = {
      notification: {
        title: "Bin Alert",
        body: "The bin is full. Please empty it.",
      },
      topic: "bin-alerts",
    };

    return admin.messaging().send(message).then((response) => {
      console.log("Notification sent successfully:", response);
    }).catch((error) => {
      console.error("Error sending notification:", error);
    });
  }

  return null;
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
