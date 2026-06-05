// Importamos Firebase desde un CDN público y gratuito
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// !!! REEMPLAZA ESTO CON LOS DATOS DE TU PROPIO PROYECTO DE FIREBASE !!!
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const timerRef = ref(db, "sharedTimer");

let interval;
const display = document.getElementById("timer-display");
const controls = document.getElementById("timer-controls");

function formatTime(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return (
    String(h).padStart(2, '0') + ":" +
    String(m).padStart(2, '0') + ":" +
    String(s).padStart(2, '0')
  );
}

// Escuchar cambios en la Base de Datos (Esto se activa para TODO EL MUNDO en tiempo real)
onValue(timerRef, (snapshot) => {
  const data = snapshot.val();
  clearInterval(interval);

  if (!data || !data.endTime) {
    display.textContent = "00:00:00";
    controls.style.display = "block";
    return;
  }

  const endTime = data.endTime;

  interval = setInterval(() => {
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
      clearInterval(interval);
      display.textContent = "00:00:00";
      controls.style.display = "block"; // Volver a mostrar controles cuando termine
      return;
    }

    display.textContent = formatTime(timeLeft);
    controls.style.display = "none"; // Ocultar controles mientras corra el timer
  }, 200); // Se actualiza 5 veces por segundo para que vaya super suave
});

// Botón de inicio: cuando alguien pulsa, calcula el futuro y lo sube a Firebase
document.getElementById("start-timer").addEventListener("click", () => {
  const hours = parseInt(document.getElementById("input-hours").value) || 0;
  const minutes = parseInt(document.getElementById("input-minutes").value) || 0;
  const seconds = parseInt(document.getElementById("input-seconds").value) || 0;

  if (hours === 0 && minutes === 0 && seconds === 0) return;

  const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  const targetEndTime = Date.now() + totalMs;

  // Guardamos en Firebase. Al hacer esto, el evento "onValue" se disparará en las pantallas de todos.
  set(timerRef, {
    endTime: targetEndTime
  });
});
