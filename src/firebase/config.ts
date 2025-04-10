import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
// import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCJoql30uCoRhc3UHCnyl57M1vFCT2-N1o",
  authDomain: "dbsisweb.firebaseapp.com",
  databaseURL: "https://dbsisweb-default-rtdb.firebaseio.com",
  projectId: "dbsisweb",
  storageBucket: "dbsisweb.firebasestorage.app",
  messagingSenderId: "711476232625",
  appId: "1:711476232625:web:a00e3508487856b3613d90",
  measurementId: "G-M0M8LFVGDC"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics if in browser environment
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };
export default app; 