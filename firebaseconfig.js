// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAf4PlQgGz_CZoYeieWpPbmxjzhk5ltbnQ",
  authDomain: "mysite-10d59.firebaseapp.com",
  projectId: "mysite-10d59",
  storageBucket: "mysite-10d59.appspot.com",
  messagingSenderId: "254624456781",
  appId: "1:254624456781:web:ca14220fd656fea0bd3c04",
  measurementId: "G-GL64NN9515"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);;
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };