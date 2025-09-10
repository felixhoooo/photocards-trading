
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxMzlFyLBSAwIAxO0YItidZ_ZIR0c2hgE",
  authDomain: "photo-card-trader.firebaseapp.com",
  projectId: "photo-card-trader",
  storageBucket: "photo-card-trader.firebasestorage.app",
  messagingSenderId: "399254194028",
  appId: "1:399254194028:web:c2d628bdf0f1cfabb61549",
  measurementId: "G-98YKHJ9JWG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, googleProvider, db, storage };
