// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDpV0LYg4hF8_WFUca9Lo6_PNlHZk44-jM",
  authDomain: "momoweb-bfe4a.firebaseapp.com",
  databaseURL: "https://momoweb-bfe4a.firebaseio.com",
  projectId: "momoweb-bfe4a",
  storageBucket: "momoweb-bfe4a.appspot.com",
  messagingSenderId: "4608974693",
  appId: "1:4608974693:web:2819c21f46358a0f014b8c",
  messagingSenderId: '4608974693'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();