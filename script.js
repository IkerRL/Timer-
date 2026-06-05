let totalSeconds;
let interval;

// Tu canal de Twitch (escríbelo en minúsculas)
const TWITCH_CHANNEL = "makacagotica"; 

// Formato más corto (MM:SS) ya que solo son 15 segundos
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}

function startCountdown() {
  clearInterval(interval); // Detiene cualquier cuenta anterior si se vuelve a activar
  totalSeconds = 15; // Fijado a 15 segundos

  const display = document.getElementById("timer-display");
  display.textContent = formatTime(totalSeconds);

  interval = setInterval(() => {
    totalSeconds--;

    if (totalSeconds < 0) {
      clearInterval(interval);
      display.textContent = "00:00";
      // Aquí puedes añadir un sonido o efecto cuando termine
      return;
    }

    display.textContent = formatTime(totalSeconds);
  }, 1000);
}

// Configuración de la conexión al chat de Twitch (Modo Lectura)
const client = new tmi.Client({
  options: { debug: false },
  channels: [TWITCH_CHANNEL]
});

client.connect();

// Escuchar los mensajes del chat
client.on('message', (channel, tags, message, self) => {
  if (self) return; // Ignorar mensajes del propio bot si los hubiera

  // Si alguien escribe exactamente "!timer" en el chat
  if (message.toLowerCase().trim() === '!timer') {
    startCountdown();
  }
});
