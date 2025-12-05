let totalSeconds;
let interval;

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return (
    String(h).padStart(2, '0') + ":" +
    String(m).padStart(2, '0') + ":" +
    String(s).padStart(2, '0')
  );
}

function startCountdown(hours, minutes, seconds) {
  clearInterval(interval); // detiene cualquier cuenta anterior
  totalSeconds = hours * 3600 + minutes * 60 + seconds;

  const display = document.getElementById("timer-display");
  display.textContent = formatTime(totalSeconds);

  interval = setInterval(() => {
    totalSeconds--;

    if (totalSeconds < 0) {
      clearInterval(interval);
      display.textContent = "00:00:00";
      return;
    }

    display.textContent = formatTime(totalSeconds);
  }, 1000);
}

// Botón de inicio
document.getElementById("start-timer").addEventListener("click", () => {
  const hours = parseInt(document.getElementById("input-hours").value) || 0;
  const minutes = parseInt(document.getElementById("input-minutes").value) || 0;
  const seconds = parseInt(document.getElementById("input-seconds").value) || 0;

  if (hours === 0 && minutes === 0 && seconds === 0) return; // evitar iniciar con 0
  startCountdown(hours, minutes, seconds);
});
