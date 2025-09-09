import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC0D6VetiIzxg2-TkIO_RQfwuk3dKSpQ80",
  authDomain: "cesizen-a9b65.firebaseapp.com",
  projectId: "cesizen-a9b65",
  storageBucket: "cesizen-a9b65.appspot.com",
  messagingSenderId: "478608003132",
  appId: "1:478608003132:web:03d8d3044b9ef0524fb339",
  measurementId: "G-TRGLM6JPJW"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");
