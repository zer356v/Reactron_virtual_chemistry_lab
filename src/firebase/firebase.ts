// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC91r1VhqMTYQFFdQe502Zq_lpEa4rNsQ0",
  authDomain: "virtual-chemistry-lab-dae76.firebaseapp.com",
  projectId: "virtual-chemistry-lab-dae76",
  storageBucket: "virtual-chemistry-lab-dae76.firebasestorage.app",
  messagingSenderId: "464924150459",
  appId: "1:464924150459:web:76b3b9001dc7ea2c16f79e",
  measurementId: "G-TY5R696FRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();