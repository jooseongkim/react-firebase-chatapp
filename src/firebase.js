import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

// firebase 설정
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyBy-K8xwPdVW4Jd36hfWMJ5nRXb-iHrB18",
    authDomain: "react-firebase-chat-app-9c2c7.firebaseapp.com",
    databaseURL: "https://react-firebase-chat-app-9c2c7-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "react-firebase-chat-app-9c2c7",
    storageBucket: "react-firebase-chat-app-9c2c7.appspot.com",
    messagingSenderId: "792630995899",
    appId: "1:792630995899:web:73a748e8b9854d4991f29e",
    measurementId: "G-VPY8C1KEJ8"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics(); //통계

export default firebase;
