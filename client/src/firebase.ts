import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnPfoElLQNnqwl14vueyqaMf1PxEVYyiA",
  authDomain: "wandergenie-93c45.firebaseapp.com",
  projectId: "wandergenie-93c45",
  storageBucket: "wandergenie-93c45.firebasestorage.app",
  messagingSenderId: "949837354812",
  appId: "1:949837354812:web:dbffd8aa4e5826207f3039",
  measurementId: "G-BDET6JSBMH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
