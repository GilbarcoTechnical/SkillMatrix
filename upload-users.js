
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

initializeApp(firebaseConfig);
const db = getFirestore();

window.showUserUpload = () => {
  document.getElementById('userUploadArea').style.display = 'block';
};

const dropZone = document.getElementById("userDropZone");
const fileInput = document.getElementById("userFileInput");
const uploadBtn = document.getElementById("userUploadBtn");
const preview = document.getElementById("userPreview");

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#f0f0f0";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.backgroundColor = "transparent";
});
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.style.backgroundColor = "transparent";
  handleUserFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", e => {
  handleUserFile(e.target.files[0]);
});

let parsedUsers = [];

function handleUserFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const rows = text.trim().split("\n").map(r => r.split(","));
   const headers = rows[0].map(h => h.trim().toLowerCase());
if (!(headers.includes("userid") && headers.includes("password") && headers.includes("session"))) {
  preview.innerText = "❌ Invalid CSV header format. Required: userId,password,session";
  return;
}

    parsedUsers = rows.slice(1).map(r => ({
      userId: r[0],
      password: r[1],
      session: r[2]
    }));

    preview.innerHTML = `<b>${parsedUsers.length}</b> users ready. First 2:<br>` +
      parsedUsers.slice(0, 2).map(u =>
        `<div><b>${u.userId}</b> → ${u.session}</div>`
      ).join("<hr>");

    uploadBtn.style.display = "block";
  };
  reader.readAsText(file);
}

uploadBtn.addEventListener("click", async () => {
  for (const user of parsedUsers) {
    await setDoc(doc(db, "users", user.userId), user);
  }
  alert("✅ All users uploaded.");
  uploadBtn.style.display = "none";
  preview.innerText = "";
});
