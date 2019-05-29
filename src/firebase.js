import firebase from "firebase/app";

const config = {
  apiKey: "AIzaSyAj2qS3_Niz_dZDHKfTT9s48TkIZRGmOes",
  authDomain: "github-issues-dd80f.firebaseapp.com",
  databaseURL: "https://github-issues-dd80f.firebaseio.com",
  projectId: "github-issues-dd80f",
  storageBucket: "github-issues-dd80f.appspot.com",
  messagingSenderId: "919580250265",
  appId: "1:919580250265:web:01c0f209e3e21770"
};
// Initialize Firebase
const fire = firebase.initializeApp(config);

export default fire;
