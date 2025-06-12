import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

initializeApp(firebaseConfig);
const db = getFirestore();

window.loadLogs = async () => {
  const logs = await getDocs(collection(db, 'logs'));
  const ul = document.getElementById('logs');
  ul.innerHTML = '';
  logs.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${new Date(data.timestamp.seconds * 1000).toLocaleString()} - ${data.userId} - ${data.action}`;
    ul.appendChild(li);
  });
};

window.assignReexam = async () => {
  const sessionName = prompt("Enter base session name (e.g. Jun2025):");
  if (!sessionName) return;

  const responses = await getDocs(collection(db, 'responses'));
  const questions = await getDocs(collection(db, 'questions'));

  const allQIDs = questions.docs.map(d => d.id);
  const failedUsers = new Set();

  responses.forEach(doc => {
    const data = doc.data();
    const correct = data.answers.filter(a =>
      questions.docs.find(q => q.id === a.qid)?.data().correct?.sort().join(',') === a.answers?.sort().join(',')
    ).length;
    const percent = (correct / 25) * 100;
    if (percent < 60 && data.session === sessionName) failedUsers.add(data.userId);
  });

  let i = 1;
  for (let user of failedUsers) {
    const reexamSession = `${sessionName}-Re${i++}`;
    const previous = responses.docs.find(r => r.data().userId === user && r.data().session === sessionName);
    const oldQIDs = previous?.data()?.answers.map(a => a.qid) || [];
    const newQIDs = shuffle(allQIDs.filter(qid => !oldQIDs.includes(qid))).slice(0, 25);

    await setDoc(doc(db, 'reexamAssignments', `${user}_${reexamSession}`), {
      userId: user,
      session: reexamSession,
      assignedQIDs: newQIDs,
      timestamp: Timestamp.now()
    });
  }

  alert(`Assigned re-exam to ${failedUsers.size} user(s).`);
};

window.viewResults = async () => {
  const sessionName = prompt("Enter session to view (e.g. Jun2025):");
  if (!sessionName) return;

  const responses = await getDocs(collection(db, 'responses'));
  const questions = await getDocs(collection(db, 'questions'));

  const questionMap = {};
  questions.docs.forEach(q => questionMap[q.id] = q.data().correct?.sort().join(','));

  const filtered = responses.docs
    .map(d => d.data())
    .filter(r => r.session === sessionName);

  let csv = "User,Score,Percentage,Pass/Fail,SubmittedAt\n";
  const output = filtered.map(data => {
    const correct = data.answers.filter(a =>
      questionMap[a.qid] === a.answers?.sort().join(',')
    ).length;
    const percent = (correct / 25 * 100).toFixed(2);
    const result = percent >= 60 ? "Pass" : "Fail";
    csv += `${data.userId},${correct},${percent},${result},${new Date(data.timestamp.seconds * 1000).toLocaleString()}\n`;
    return `${data.userId}: ${correct}/25 (${result})`;
  });

  alert(output.join('\n'));
  downloadCSV(csv, `Results-${sessionName}.csv`);
};

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
