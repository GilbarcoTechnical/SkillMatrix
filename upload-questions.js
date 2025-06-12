import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

initializeApp(firebaseConfig);
const db = getFirestore();

window.showUpload = () => {
  document.getElementById('uploadArea').style.display = 'block';
};

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const preview = document.getElementById("preview");

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
  handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", e => {
  handleFile(e.target.files[0]);
});

let parsedQuestions = [];

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const rows = text.trim().split("\n").map(r => r.split(","));
    if (rows[0].length < 7 || rows[0][0] !== "QID") {
      preview.innerText = "❌ Invalid CSV format.";
      return;
    }

    parsedQuestions = rows.slice(1).map(r => ({
      qid: r[0],
      question: r[1],
      options: [r[2], r[3], r[4], r[5]],
      correct: r[6].split(",").map(x => x.trim())
    }));

    preview.innerHTML = `<b>${parsedQuestions.length}</b> questions ready. First 2:<br>` +
      parsedQuestions.slice(0, 2).map(q =>
        `<div><b>${q.qid}</b>: ${q.question}<br>Options: ${q.options.join(", ")}<br>Correct: ${q.correct.join(", ")}</div>`
      ).join("<hr>");

    uploadBtn.style.display = "block";
  };
  reader.readAsText(file);
}

uploadBtn.addEventListener("click", async () => {
  for (const q of parsedQuestions) {
    await setDoc(doc(db, "questions", q.qid), q);
  }
  alert("✅ All questions uploaded to Firestore.");
  uploadBtn.style.display = "none";
  preview.innerText = "";
});
