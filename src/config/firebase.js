/**
 * @fileoverview Configuración de Firebase
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Inicializa Firebase UNA SOLA VEZ y expone únicamente el servicio
 * de Authentication (auth). Firebase también tiene Firestore y Storage,
 * pero en Pandea SOLO usamos Firebase para login/registro — la base
 * de datos real está en Supabase, no en Firebase.
 */

import { initializeApp } from "firebase/app";
import { getAuth }       from "firebase/auth";

/**
 * Credenciales del proyecto Firebase.
 * Estas SÍ son públicas y seguras de exponer en el frontend —
 * Firebase está diseñado para que estas llaves vivan en el cliente,
 * la seguridad real la dan las Reglas de Seguridad configuradas
 * en la consola de Firebase, no estas credenciales.
 */
const firebaseConfig = {
  apiKey:            "AIzaSyAHtQ0E74_tAyyFCoYrJNDLQqGb7U2DrS0",
  authDomain:        "pandea-tienda.firebaseapp.com",
  projectId:         "pandea-tienda",
  storageBucket:     "pandea-tienda.firebasestorage.app",
  messagingSenderId: "1027160232171",
  appId:             "1:1027160232171:web:8fe399396619b2e4702eae",
  measurementId:     "G-NM1CRLQXG4"
};

// Inicializa la app de Firebase con esas credenciales
const app = initializeApp(firebaseConfig);

/**
 * Exportamos solo "auth" (Authentication).
 * Cualquier archivo que necesite hacer login/registro/logout
 * importa esto: import { auth } from "../config/firebase"
 */
export const auth = getAuth(app);

export default app;
