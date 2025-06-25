// update.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase config


//REPLACE WITH YOURS

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Show user info
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("userName").textContent = user.displayName || "No Name";
        document.getElementById("userEmail").textContent = user.email || "No Email";
        document.getElementById("userProfilePicture").src = user.photoURL || "/default-profile.png";
    } else {
        window.location.href = "/index.html";
    }
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "/index.html";
        }).catch((error) => {
            console.error("Logout error:", error.message);
        });
    });
}
