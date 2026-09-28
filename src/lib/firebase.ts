import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3CjgE2VEu2dc94gtEQsDg_TA-V_2iDlA",
  authDomain: "vibrandstream.firebaseapp.com",
  projectId: "vibrandstream",
  storageBucket: "vibrandstream.firebasestorage.app",
  messagingSenderId: "1049110200463",
  appId: "1:1049110200463:web:fd0d8a30bd92d2925870fa",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);