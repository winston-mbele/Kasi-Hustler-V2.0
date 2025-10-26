// firebase-config.js

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js"; 
// Note: You do not need to import getAnalytics() or getAnalytics(app) unless you plan to use it.

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBybbXc6oar4BO7731p3ugPTatuGKoy3Es",
    authDomain: "kasi-hustler.firebaseapp.com",
    projectId: "kasi-hustler",
    storageBucket: "kasi-hustler.firebasestorage.app",
    messagingSenderId: "54053424495",
    appId: "1:54053424495:web:dafdf52c6cb26fef976c9a",
    measurementId: "G-D4TZMWSQY1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
// Note: Analytics is excluded as it wasn't exported in your previous file.