// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFrLVaoqJoVt_iv3zqPh9oO7mL15rTNio",
  authDomain: "inventoryapp-1beb2.firebaseapp.com",
  projectId: "inventoryapp-1beb2",
  storageBucket: "inventoryapp-1beb2.appspot.com",
  messagingSenderId: "51322721635",
  appId: "1:51322721635:web:bdf5f6243af4fce5a0af56",
  measurementId: "G-WNK23LYLF1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app, firebaseConfig };
