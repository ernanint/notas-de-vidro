import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - você precisará substituir pelos seus dados
const firebaseConfig = {
  apiKey: "AIzaSyC8BTyJgXprsfTX9uitOMiJybrXf3lUM2w",
  authDomain: "notas-de-vidro.firebaseapp.com",
  projectId: "notas-de-vidro", 
  storageBucket: "notas-de-vidro.firebasestorage.app",
  messagingSenderId: "863456225633",
  appId: "1:863456225633:web:5fff88f4aef50a3b48bd20"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

export default app;
