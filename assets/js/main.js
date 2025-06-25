// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase config
// const firebaseConfig = {
//     apiKey: "AIzaSyBi1A_eLMEAVYHYLIYCngxBghxtSX-82GQ",
//     authDomain: "code-ai-64d3f.firebaseapp.com",
//     projectId: "code-ai-64d3f",
//     storageBucket: "code-ai-64d3f.appspot.com",
//     messagingSenderId: "807664321440",
//     appId: "1:807664321440:web:8012990c6f9bf4e1379ac5",
//     measurementId: "G-52PYR9SRN6"
// };

//REPLACE WITH YOURS


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Google Login
const googleLogin = document.getElementById("google-login");
if (googleLogin) {
    googleLogin.addEventListener("click", () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                window.location.href = "/pages/index.html";
            })
            .catch((error) => {
                console.error("Google login error:", error.message);
            });
    });
}

// Apple Login
const appleLogin = document.getElementById("apple-login");
if (appleLogin) {
    appleLogin.addEventListener("click", () => {
        signInWithPopup(auth, appleProvider)
            .then((result) => {
                window.location.href = "/pages/index.html";
            })
            .catch((error) => {
                console.error("Apple login error:", error.message);
            });
    });
}

// Optional: Auto redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === "/index.html") {
        window.location.href = "/pages/index.html";
    }
});
