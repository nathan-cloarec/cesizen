const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUserAndFirestore = functions.https.onCall(async (data, context) => {
  const uid = data.uid;

  try {
    // 🔥 Supprime d’abord dans Authentication
    await admin.auth().deleteUser(uid);
    console.log(`Utilisateur ${uid} supprimé dans Auth`);

    // 🔥 Puis dans Firestore
    await admin.firestore().collection("utilisateurs").doc(uid).delete();
    console.log(`Document Firestore ${uid} supprimé`);

    return { success: true };
  } catch (error) {
    console.error("Erreur suppression :", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
