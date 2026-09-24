// Importar las funciones necesarias de Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración única de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3CjgE2VEu2dc94gtEQsDg_TA-V_2iDlA",
  authDomain: "vibrandstream.firebaseapp.com",
  projectId: "vibrandstream",
  storageBucket: "vibrandstream.firebasestorage.app",
  messagingSenderId: "1049110200463",
  appId: "1:1049110200463:web:fd0d8a30bd92d2925870fa"
};

// Inicializar Firebase (esta condición evita que Next.js intente conectarse dos veces por error)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exportar los servicios para poder usarlos en el resto de la página
export const auth = getAuth(app); // Para el login de administrador
export const db = getFirestore(app); // Para guardar los productos y precios