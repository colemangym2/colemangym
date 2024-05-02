// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNuBBP3dA_7EHsfeewosiZAN1COqQDpX8",
  authDomain: "colemangym-11ff0.firebaseapp.com",
  projectId: "colemangym-11ff0",
  storageBucket: "colemangym-11ff0.appspot.com",
  messagingSenderId: "782070159487",
  appId: "1:782070159487:web:23d99de9509999e923474a"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
export default appFirebase;