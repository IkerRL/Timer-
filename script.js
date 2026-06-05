// Tu configuración optimizada (sin tokens problemáticos)
const TWITCH_CONFIG = {
    canal:   'makacagotica', // Tu canal en minúsculas
    comando: '!voto',        // El comando que activará el timer
};

let totalSeconds;
let interval;

// Formatea el tiempo en MM:SS
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}

// Función que inicia la cuenta atrás de 15 segundos
function startCountdown() {
  clearInterval(interval); // Resetea si ya había un timer corriendo
  totalSeconds = 15; // Ajustado a 15 segundos

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

// Configuración Anónima (Para que funcione siempre sin caídas de Token)
const client = new tmi.Client({
  options: { debug: true },
  channels: [TWITCH_CONFIG.canal] // Solo le decimos qué canal escuchar
});

// Conectamos al chat de Twitch
client.connect().catch(err => console.error("Error al conectar:", err));

// Escuchar el chat en vivo
client.on('message', (channel, tags, message, self) => {
  // Pasamos el mensaje a minúsculas y quitamos espacios para evitar errores de escritura
  const mensajeLimpio = message.toLowerCase().trim();
  const comandoLimpio = TWITCH_CONFIG.comando.toLowerCase().trim();

  // SI EL MENSAJE ES EL COMANDO, SE ACTIVA LA CUENTA ATRÁS
  if (mensajeLimpio === comandoLimpio) {
    startCountdown();
  }
});
