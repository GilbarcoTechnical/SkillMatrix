import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

initializeApp(firebaseConfig);
const auth = getAuth();

window.initLogin = async () => {
  const id = document.getElementById('loginId').value.trim();
  const msg = document.getElementById('msg');
  msg.textContent = '';

  if (id.includes('@')) {
    const pass = prompt("Enter admin password:");
    if (!pass) return msg.textContent = 'Password required!';
    signInWithEmailAndPassword(auth, id, pass)
      .then(() => window.location.href = 'admin.html')
      .catch(e => { msg.textContent = e.message });
  } else {
    sessionStorage.setItem('userId', id);
    window.location.href = 'exam.html';
  }
};
