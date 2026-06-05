const TWITCH_CONFIG = {
    // AHORA ES UNA LISTA: Añade aquí todos los canales que quieras escuchar (en minúsculas)
    canales: ['trollantsb', 'makacagotica'], 
    
    comando: '!timer',            // Comando para empezar
    comandoReset: '!reset',      // Comando para reiniciar
    usuariosPermitidos: ['ikeer_rl', 'panaoso', 'trollantsb', 'makacagotica', '6Nssj6'] // Usuarios autorizados
};

let totalSeconds;
let interval;

// CONFIGURACIÓN DE AUDIO
const audioInicio = new Audio('inicio.mp3');
const audioFin = new Audio('fin.mp3');

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
}

function startCountdown() {
  clearInterval(interval); 
  totalSeconds = 15; 

  audioInicio.currentTime = 0;
  audioInicio.play().catch(err => console.log("Audio bloqueado por el navegador hasta que interactúes con la página:", err));
  
  audioFin.pause();
  audioFin.currentTime = 0;

  const display = document.getElementById("timer-display");
  display.textContent = formatTime(totalSeconds);

  interval = setInterval(() => {
    totalSeconds--;

    if (totalSeconds < 0) {
      clearInterval(interval);
      display.textContent = "00:00";
      
      audioFin.currentTime = 0;
      audioFin.play().catch(err => console.log("Audio bloqueado:", err));
      
      return;
    }

    display.textContent = formatTime(totalSeconds);
  }, 1000);
}

function resetTimer() {
  clearInterval(interval);
  
  audioInicio.pause();
  audioInicio.currentTime = 0;
  audioFin.pause();
  audioFin.currentTime = 0;

  const display = document.getElementById("timer-display");
  display.textContent = formatTime(15); 
  console.log("Temporizador reseteado y audios detenidos.");
}

// CONEXIÓN MULTICANAL POR WEBSOCKETS
function conectarTwitch() {
    const usuarioAnonimo = 'justinfan' + Math.floor(10000 + Math.random() * 90000);
    const twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchWS.onopen = function() {
        twitchWS.send('PASS kappa');
        twitchWS.send('NICK ' + usuarioAnonimo);
        
        // NUEVO: Nos unimos a cada uno de los canales configurados en la lista
        TWITCH_CONFIG.canales.forEach(canal => {
            twitchWS.send('JOIN #' + canal.toLowerCase().trim());
        });
        
        console.log("Conectado con éxito a los canales: " + TWITCH_CONFIG.canales.join(', '));
    };

    twitchWS.onmessage = function(event) {
        const line = event.data;
        
        if (line.includes('PING')) { 
            twitchWS.send('PONG :tmi.twitch.tv'); 
        }
        
        // El lector detectará los mensajes sin importar de cuál de los dos canales provengan
        const match = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/);
        if (match) {
            const usuario = match[1].toLowerCase();
            const mensaje = match[2].trim().toLowerCase();
            
            if (mensaje === TWITCH_CONFIG.comando.toLowerCase()) {
                if (TWITCH_CONFIG.usuariosPermitidos.includes(usuario)) {
                    startCountdown();
                }
            }
            
            if (mensaje === TWITCH_CONFIG.comandoReset.toLowerCase()) {
                if (TWITCH_CONFIG.usuariosPermitidos.includes(usuario)) {
                    resetTimer();
                }
            }
        }
    };

    twitchWS.onerror = function(error) {
        console.error("Error en la conexión:", error);
    };

    twitchWS.onclose = function() {
        console.log("Conexión cerrada. Reconectando en 5 segundos...");
        setTimeout(conectarTwitch, 5000);
    };
}

conectarTwitch();
