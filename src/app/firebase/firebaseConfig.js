// firebaseConfig.ts
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnr3CCVIFBwMlnYFVKj7pZF2PXtCgBU-M",
  authDomain: "chat-4252a.firebaseapp.com",
  projectId: "chat-4252a",
  storageBucket: "chat-4252a.firebasestorage.app",
  messagingSenderId: "206938549631",
  appId: "1:206938549631:web:9ab430ef91e1c181ec7e4a",
  measurementId: "G-1SE1MF1WH1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
  // ✅ Initialize Firebase Auth
const db = getFirestore(app); // ✅ Initialize Firestore

export { db }; // ✅ Export 'auth' and 'db'
