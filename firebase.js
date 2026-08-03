import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "churrasconabrasa-d9b6f.firebaseapp.com",
    projectId: "churrasconabrasa-d9b6f",
    storageBucket: "churrasconabrasa-d9b6f.firebasestorage.app",
    messagingSenderId: "477085665132",
    appId: "1:477085665132:web:b1b671e53af82742601549"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);