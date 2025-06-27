// update.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Firebase config



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Show user info
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userProfilePicture").src = user.photoURL || "https://www.profilebakery.com/wp-content/uploads/2023/04/LINKEDIN-Profile-Picture-AI.jpg";
  } else {
    window.location.href = "/index.html";
  }
});


  const profileImage = document.getElementById("userProfilePicture");
  const popupMenu = document.getElementById("popupMenu");

  profileImage.addEventListener("click", () => {
    popupMenu.style.display = popupMenu.style.display === "block" ? "none" : "block";
  });

  // Hide popup when clicking outside
  document.addEventListener("click", function (event) {
    if (!profileImage.contains(event.target) && !popupMenu.contains(event.target)) {
      popupMenu.style.display = "none";
    }
  });


// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        window.location.href = "/index.html";
      })
      .catch((error) => {
        console.error("Logout error:", error.message);
      });
  });
}
