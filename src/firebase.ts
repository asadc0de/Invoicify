import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCD7Q1jsNe7Ww04-B7RYfAcyr5-onADgAc",
  authDomain: "invoicify-e4c86.firebaseapp.com",
  projectId: "invoicify-e4c86",
  storageBucket: "invoicify-e4c86.firebasestorage.app",
  messagingSenderId: "46210103821",
  appId: "1:46210103821:web:2388afc2948d70a345f344"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence for better performance
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.log('Persistence failed - multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.log('Persistence not supported');
  }
});

// Configure auth provider for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;