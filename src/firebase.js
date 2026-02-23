import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAaaLUzmKROPXFT-d4z-Z7YsAcV7f9FOzE",
  authDomain: "hostel-assist304.firebaseapp.com",
  projectId: "hostel-assist304",
  storageBucket: "hostel-assist304.firebasestorage.app",
  messagingSenderId: "885416898036",
  appId: "1:885416898036:web:9e59fb52826d7a7536dda1",
  measurementId: "G-B5XMF7ETCM"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
export default app;
