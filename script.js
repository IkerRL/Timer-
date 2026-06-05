// Tu configuración personalizada
const TWITCH_CONFIG = {
    canal:   'makacagotica',       
    // Limpiamos el token para dejar solo los caracteres (sin el "oauth:")
    token:   'qesfuu0cdx4ca7mj5jqk2h6u0qayif', 
    nick:    'makacagotica',       
    comando: '!timer',               
};

let totalSeconds;
let interval;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}

function startCountdown() {
  console.log("¡Iniciando el temporizador de 15 segundos!");
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

// Configuración corregida para tmi.js
const client = new tmi.Client({
  options: { debug: true }, // Activamos el debug para ver qué pasa en la consola
  identity: {
    username: TWITCH_CONFIG.nick,
    // Aseguramos que lleve el prefijo correcto internamente
    password: `oauth:${TWITCH_CONFIG.token}` 
  },
  channels: [TWITCH_CONFIG.canal]
});

// Conectar y avisar en consola
client.connect()
  .then(() => console.log(`%cConectado exitosamente al chat de ${TWITCH_CONFIG.canal}`, "color: green; font-weight: bold;"))
  .catch(err => console.error("Error crítico al conectar a Twitch:", err));

// Escuchar los mensajes del chat
client.on('message', (channel, tags, message, self) => {
  console.log(`Mensaje recibido de ${tags['display-name']}: ${message}`);

  // Compara el comando
  if (message.toLowerCase().trim() === TWITCH_CONFIG.comando.toLowerCase()) {
    startCountdown();
  }
});
