// Tu configuración personalizada
const TWITCH_CONFIG = {
    canal:   'makacagotica',       
    token:   'oauth:hhqcdtugdwdw2ivhnhaio6jr5zy29g', 
    nick:    'makacagotica',       
    comando: '!voto',               
};

let totalSeconds;
let interval;

// Formatea el tiempo en MM:SS
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}

// Inicia la cuenta regresiva de 15 segundos
function startCountdown() {
  clearInterval(interval); // Detiene cualquier cuenta anterior que esté activa
  totalSeconds = 15; // Fijado a 15 segundos

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

// Configuración de tmi.js usando tus credenciales
const client = new tmi.Client({
  options: { debug: false },
  identity: {
    username: TWITCH_CONFIG.nick,
    password: TWITCH_CONFIG.token
  },
  channels: [TWITCH_CONFIG.canal]
});

// Conectar a los servidores de Twitch
client.connect().catch(err => console.error("Error al conectar a Twitch:", err));

// Escuchar los mensajes del chat en tiempo real
client.on('message', (channel, tags, message, self) => {
  // Opcional: Ignorar mensajes del propio bot/cuenta si fuera necesario
  // if (self) return;

  // Compara el mensaje del chat con tu comando (ignora mayúsculas/minúsculas y espacios extra)
  if (message.toLowerCase().trim() === TWITCH_CONFIG.comando.toLowerCase()) {
    startCountdown();
  }
});
