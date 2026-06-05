const TWITCH_CONFIG = {
    canal:   'makacagotica', // Tu canal en minúsculas
    comando: '!voto',        // Comando exacto
};

let totalSeconds;
let interval;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}

function startCountdown() {
  clearInterval(interval); 
  totalSeconds = 15; 

  const display = document.getElementById("timer-display");
  display.textContent = formatTime(totalSeconds);

  interval = setInterval(() => {
    totalSeconds--;

    if (totalSeconds < 0) {
      clearInterval(interval);
      display.textContent = "00:00";
      return;
    }

    display.textContent = formatTime(totalSeconds);
  }, 1000);
}

// Conexión limpia y anónima a Twitch
const client = new tmi.Client({
  options: { debug: false },
  channels: [TWITCH_CONFIG.canal]
});

client.connect().catch(err => console.error("Error conectando a Twitch:", err));

// Leer el chat
client.on('message', (channel, tags, message, self) => {
  // Pasamos todo a minúsculas para evitar fallos si escriben !Voto o !VOTO
  if (message.toLowerCase().trim() === TWITCH_CONFIG.comando.toLowerCase()) {
    startCountdown();
  }
});
