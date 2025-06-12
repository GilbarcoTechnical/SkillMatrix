import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

initializeApp(firebaseConfig);
const db = getFirestore();

window.loadLogs = async () => {
  const logs = await getDocs(collection(db, 'logs'));
  const ul = document.getElementById('logs');
  logs.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${new Date(data.timestamp.seconds * 1000).toLocaleString()} - ${data.userId} - ${data.action}`;
    ul.appendChild(li);
  });
};
