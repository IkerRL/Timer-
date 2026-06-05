const TWITCH_CONFIG = {
    canal:   'ikeer_rl',         // Tu canal en minúsculas
    comando: '!timer',            // Comando para empezar
    comandoReset: '!reset',      // Comando para reiniciar
    usuariosPermitidos: ['ikeer_rl', 'valeria', 'cris', 'luve', 'makacagotica'] // Usuarios autorizados
};

let totalSeconds;
let interval;

// CONFIGURACIÓN DE AUDIO
// Asegúrate de subir estos dos archivos con estos nombres exactos a tu GitHub
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

  // Reproducir sonido de inicio (lo reiniciamos a 0 por si se pulsa varias veces)
  audioInicio.currentTime = 0;
  audioInicio.play().catch(err => console.log("Audio bloqueado por el navegador hasta que interactúes con la página:", err));
  
  // Apagar el sonido de fin por si seguía sonando de antes
  audioFin.pause();
  audioFin.currentTime = 0;

  const display = document.getElementById("timer-display");
  display.textContent = formatTime(totalSeconds);

  interval = setInterval(() => {
    totalSeconds--;

    if (totalSeconds < 0) {
      clearInterval(interval);
      display.textContent = "00:00";
      
      // Reproducir sonido de fin al terminar la cuenta atrás
      audioFin.currentTime = 0;
      audioFin.play().catch(err => console.log("Audio bloqueado:", err));
      
      return;
    }

    display.textContent = formatTime(totalSeconds);
  }, 1000);
}

function resetTimer() {
  clearInterval(interval);
  
  // Detener y reiniciar todos los audios inmediatamente
  audioInicio.pause();
  audioInicio.currentTime = 0;
  audioFin.pause();
  audioFin.currentTime = 0;

  const display = document.getElementById("timer-display");
  display.textContent = formatTime(15); 
  console.log("Temporizador reseteado y audios detenidos.");
}

// CONEXIÓN DIRECTA POR WEBSOCKETS (Anónima y segura)
function conectarTwitch() {
    const usuarioAnonimo = 'justinfan' + Math.floor(10000 + Math.random() * 90000);
    const twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchWS.onopen = function() {
        twitchWS.send('PASS kappa');
        twitchWS.send('NICK ' + usuarioAnonimo);
        twitchWS.send('JOIN #' + TWITCH_CONFIG.canal.toLowerCase());
        console.log("Conectado al chat de Twitch. Sistema de sonido listo.");
    };

    twitchWS.onmessage = function(event) {
        const line = event.data;
        
        if (line.includes('PING')) { 
            twitchWS.send('PONG :tmi.twitch.tv'); 
        }
        
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
        setTimeout(conectarTwitch, 5000);
    };
}

conectarTwitch();
