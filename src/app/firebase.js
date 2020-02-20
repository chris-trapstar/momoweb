import * as firebase from "firebase/app";
import "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDpV0LYg4hF8_WFUca9Lo6_PNlHZk44-jM",
  authDomain: "momoweb-bfe4a.firebaseapp.com",
  databaseURL: "https://momoweb-bfe4a.firebaseio.com",
  projectId: "momoweb-bfe4a",
  storageBucket: "momoweb-bfe4a.appspot.com",
  messagingSenderId: "4608974693",
  appId: "1:4608974693:web:2819c21f46358a0f014b8c"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.usePublicVapidKey('BK2-U9-08q7v1U1Bs2UltDFqCLSNlEcUuI2ZuWm_KRd4UbVADuJFjnRawWFYdbWfa2ig2Rd0H-ewJY7H6bBYp8o');
