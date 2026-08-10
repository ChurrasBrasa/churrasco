import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

const firebaseConfigComentarios = {
    apiKey: "AIzaSyAdgIPjo0djQEUv3Qo-P1A2RPNWhhWITWI",
    authDomain: "churrasconabrasa-d9b6f.firebaseapp.com",
    projectId: "churrasconabrasa-d9b6f",
    storageBucket: "churrasconabrasa-d9b6f.firebasestorage.app",
    messagingSenderId: "477085665132",
    appId: "1:477085665132:web:b1b671e53af82742601549"
};

const firebaseConfigPedidos = {
    apiKey: "AIzaSyDRQ6twd8a0MdWCWtR6UTrovBjoNZncfI0",
    authDomain: "bancodedadoschurras.firebaseapp.com",
    projectId: "bancodedadoschurras",
    storageBucket: "bancodedadoschurras.firebasestorage.app",
    messagingSenderId: "535893524697",
    appId: "1:535893524697:web:d42395e9b13a36e87dbec8"
};

const appComentarios = initializeApp(firebaseConfigComentarios, "comentariosApp");
const appPedidos = initializeApp(firebaseConfigPedidos, "pedidosApp");

export const dbComentarios = getFirestore(appComentarios);
export const dbPedidos = getFirestore(appPedidos);
export const authPedidos = getAuth(appPedidos);
