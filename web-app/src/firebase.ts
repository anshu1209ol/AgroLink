import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClARHMHsfqPhKqUSF93hG382hy-vHbz-s",
  authDomain: "agrolink-72cdc.firebaseapp.com",
  projectId: "agrolink-72cdc",
  storageBucket: "agrolink-72cdc.firebasestorage.app",
  messagingSenderId: "1037720629434",
  appId: "1:1037720629434:web:9a659fc850b81be7f1d283",
  measurementId: "G-5VTTWD6W99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
