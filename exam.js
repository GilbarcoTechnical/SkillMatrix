import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

initializeApp(firebaseConfig);
const db = getFirestore();

let questions = [];
let timeLeft = 3600; // 60 minutes in seconds
let timerInterval;

const userId = sessionStorage.getItem('userId');
const LOCAL_KEY = `exam-${userId}`;
const SUBMIT_KEY = `submitted-${userId}`;
if (localStorage.getItem(SUBMIT_KEY)) {
  alert("You have already submitted this exam.");
  window.location.href = "index.html";
}
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function loadTimer() {
  const saved = localStorage.getItem(`${LOCAL_KEY}-timer`);
  if (saved) timeLeft = parseInt(saved);
  document.getElementById('timer').textContent = formatTime(timeLeft);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = formatTime(timeLeft);
    localStorage.setItem(`${LOCAL_KEY}-timer`, timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time is up! Submitting exam.");
      submitExam();
    }
  }, 1000);
}

async function loadQuestions() {
  const saved = localStorage.getItem(`${LOCAL_KEY}-questions`);
  if (saved) {
    questions = JSON.parse(saved);
    renderQuestions();
  } else {
    const qs = await getDocs(collection(db, 'questions'));
    const all = qs.docs.map(d => ({ id: d.id, ...d.data() }));
    questions = shuffle(all).slice(0, 25);
    localStorage.setItem(`${LOCAL_KEY}-questions`, JSON.stringify(questions));
    renderQuestions();
  }
}

function renderQuestions() {
  const container = document.getElementById('questionContainer');
  container.innerHTML = '';
  questions.forEach((q, i) => {
    const qDiv = document.createElement('div');
    qDiv.innerHTML = `<p><b>Q${i+1}.</b> ${q.question}</p>` +
      q.options.map((opt, j) => {
        const code = String.fromCharCode(65 + j);
        return `<label><input type="checkbox" name="q${q.id}" value="${code}"> ${code}. ${opt}</label><br>`;
      }).join('');
    container.appendChild(qDiv);
  });
}

window.submitExam = async () => {
  clearInterval(timerInterval);
  const answers = questions.map(q => {
    const selected = Array.from(document.querySelectorAll(`input[name="q${q.id}"]:checked`)).map(x => x.value);
    return { qid: q.id, answers: selected };
  });

  await addDoc(collection(db, 'responses'), {
    userId,
    answers,
    timestamp: Timestamp.now()
  });

  localStorage.removeItem(`${LOCAL_KEY}-questions`);
  localStorage.removeItem(`${LOCAL_KEY}-timer`);
  alert("Submitted successfully!");
  window.location.href = "index.html";
};

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuestions();
  loadTimer();
});
