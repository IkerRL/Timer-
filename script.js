const TWITCH_CONFIG = {
    canal:   'ikeer_rl',         // Tu canal en minúsculas
    comando: '!voto',            // Comando para empezar
    comandoReset: '!reset',      // NUEVO: Comando para reiniciar
    
    // NUEVO: Lista de usuarios permitidos (¡Escríbelos en minúsculas!)
    usuariosPermitidos: ['ikeer_rl', 'valeria', 'cris', 'luve', 'makacagotica'] 
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

// NUEVO: Función para resetear el temporizador al estado inicial
function resetTimer() {
  clearInterval(interval);
  const display = document.getElementById("timer-display");
  display.textContent = formatTime(15); // Lo vuelve a dejar en 00:15
  console.log("Temporizador reseteado por un administrador.");
}

// CONEXIÓN DIRECTA POR WEBSOCKETS (Anónima y segura)
function conectarTwitch() {
    const usuarioAnonimo = 'justinfan' + Math.floor(10000 + Math.random() * 90000);
    const twitchWS = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

    twitchWS.onopen = function() {
        twitchWS.send('PASS kappa');
        twitchWS.send('NICK ' + usuarioAnonimo);
        twitchWS.send('JOIN #' + TWITCH_CONFIG.canal.toLowerCase());
        console.log("Conectado al chat de Twitch. Control de acceso activado.");
    };

    twitchWS.onmessage = function(event) {
        const line = event.data;
        
        if (line.includes('PING')) { 
            twitchWS.send('PONG :tmi.twitch.tv'); 
        }
        
        const match = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.+)/);
        if (match) {
            const usuario = match[1].toLowerCase(); // Guardamos quién envió el mensaje
            const mensaje = match[2].trim().toLowerCase();
            
            // 1. VALIDAR COMANDO !VOTO
            if (mensaje === TWITCH_CONFIG.comando.toLowerCase()) {
                // Comprobamos si el usuario está en la lista de permitidos
                if (TWITCH_CONFIG.usuariosPermitidos.includes(usuario)) {
                    startCountdown();
                } else {
                    console.log(`Usuario no autorizado intentó usar !voto: ${usuario}`);
                }
            }
            
            // 2. VALIDAR COMANDO !RESET
            if (mensaje === TWITCH_CONFIG.comandoReset.toLowerCase()) {
                // Comprobamos si el usuario está en la lista de permitidos
                if (TWITCH_CONFIG.usuariosPermitidos.includes(usuario)) {
                    resetTimer();
                } else {
                    console.log(`Usuario no autorizado intentó usar !reset: ${usuario}`);
                }
            }
        }
    };

    twitchWS.onerror = function(error) {
        console.error("Error en la conexión:", error);
    };

    twitchWS.onclose = function() {
        console.log("Conexión cerrada. Reconectando...");
        setTimeout(conectarTwitch, 5000);
    };
}

conectarTwitch();
