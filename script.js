const TWITCH_CONFIG = {
    canal:   'ikeer_rl', // Tu canal en minúsculas
    comando: '!voto',    // Comando exacto
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

// CONEXIÓN DIRECTA POR WEBSOCKETS (Sin librerías y 100% anónima)
function conectarTwitch() {
    // Generamos un nombre de usuario fantasma para conectar sin contraseña (modo solo lectura)
    const usuarioAnonimo = 'justinfan' + Math.floor(10000 + Math.random() * 90000);
    const twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchWS.onopen = function() {
        twitchWS.send('PASS kappa'); // Contraseña genérica para el modo anónimo
        twitchWS.send('NICK ' + usuarioAnonimo);
        twitchWS.send('JOIN #' + TWITCH_CONFIG.canal.toLowerCase());
        console.log("Conectado al chat de Twitch de forma segura y anónima");
    };

    twitchWS.onmessage = function(event) {
        const line = event.data;
        
        // Responder al PING de Twitch para que no nos eche por inactividad
        if (line.includes('PING')) { 
            twitchWS.send('PONG :tmi.twitch.tv'); 
        }
        
        // Filtrar y leer los mensajes del chat
        const match = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/);
        if (match) {
            const mensaje = match[2].trim().toLowerCase();
            
            // Si el mensaje es exactamente tu comando, inicia el tiempo
            if (mensaje === TWITCH_CONFIG.comando.toLowerCase()) {
                startCountdown();
            }
        }
    };

    twitchWS.onerror = function(error) {
        console.error("Error en la conexión:", error);
    };

    // Si por algún motivo se cae la conexión, se reconecta automáticamente a los 5 segundos
    twitchWS.onclose = function() {
        console.log("Conexión cerrada. Reconectando...");
        setTimeout(conectarTwitch, 5000);
    };
}

// Iniciamos la escucha del chat al cargar la página
conectarTwitch();
