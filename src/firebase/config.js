import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfqLbsT2Gi2iL1gcyIH1hQntchl48U0Rk",
  authDomain: "studyquest-42ead.firebaseapp.com",
  projectId: "studyquest-42ead",
  storageBucket: "studyquest-42ead.firebasestorage.app",
  messagingSenderId: "272274956590",
  appId: "1:272274956590:web:4857bcbaae8583ef51dabf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;