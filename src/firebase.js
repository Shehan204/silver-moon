import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDr_ovOEVN7uDQ23AJM36djyGWdhkK4_vI",
    authDomain: "moon-64b74.firebaseapp.com",
    databaseURL: "https://moon-64b74-default-rtdb.firebaseio.com",
    projectId: "moon-64b74",
    storageBucket: "moon-64b74.firebasestorage.app",
    messagingSenderId: "175347651474",
    appId: "1:175347651474:web:b4bc5c0634797bcd0de74b",
    measurementId: "G-HXSZ5XTY2F"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  export { db, collection, addDoc, setDoc, doc, getDocs };