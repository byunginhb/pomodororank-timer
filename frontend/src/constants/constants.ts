// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCmpQGzN3LGyFP_cNaLU9Nq7sUc4OuaALk',
  authDomain: 'pomodoro-rank-timer.firebaseapp.com',
  projectId: 'pomodoro-rank-timer',
  storageBucket: 'pomodoro-rank-timer.firebasestorage.app',
  messagingSenderId: '607738792499',
  appId: '1:607738792499:web:90feaa78189fca4219b146',
  measurementId: 'G-5G6EB8DBX3',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
