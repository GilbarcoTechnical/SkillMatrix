import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

initializeApp(firebaseConfig);
const db = getFirestore();

let questions = [];
document.addEventListener('DOMContentLoaded', async () => {
  const qs = await getDocs(collection(db, 'questions'));
  questions = qs.docs.map(d => ({ id: d.id, ...d.data() }));
  const container = document.getElementById('questionContainer');
  questions.forEach((q, i) => {
    const el = document.createElement('div');
    el.innerHTML = `<div>${i+1}. ${q.text}</div>` + q.options.map(opt => `
      <label><input name="q${q.id}" value="${opt}" type="checkbox"> ${opt}</label>
    `).join('');
    container.appendChild(el);
  });
});

window.submitExam = async () => {
  const userId = sessionStorage.getItem('userId');
  const answers = questions.map(q => {
    const selected = Array.from(document.getElementsByName(`q${q.id}`))
                          .filter(ch => ch.checked).map(ch => ch.value);
    return { qid: q.id, answers: selected };
  });
  await addDoc(collection(db, 'responses'), {
    userId, answers, timestamp: Timestamp.now()
  });
  alert("Submitted!");
  window.location.href = 'index.html';
};
