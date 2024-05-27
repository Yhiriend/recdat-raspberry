// Crear elemento video
const video = document.createElement("video");

// Obtener el canvas y su contexto
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

// Obtener el botón para escanear QR
const btnScanQR = document.getElementById("btn-scan-qr");

// Estado de escaneo
let scanning = false;

// Variable para guardar la información del QR
let qrInfo = '';

// Encender la cámara
const encenderCamara = () => {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      scanning = true;
      btnScanQR.hidden = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true); // evita que Safari abra el video en pantalla completa
      video.srcObject = stream;
      video.play();
      tick();
      scan();
    });
};



// Función para dibujar en el canvas
function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  scanning && requestAnimationFrame(tick);
}

// Función para escanear QR
function scan() {
  try {
    qrcode.decode();
  } catch (e) {
    setTimeout(scan, 300);
  }
}

// Apagar la cámara
const cerrarCamara = () => {
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  canvasElement.hidden = true;
  btnScanQR.hidden = false;
};

// Activar sonido
const activarSonido = () => {
  var audio = document.getElementById("audioScaner");
  audio.play();
};

let d = { id: null, nom: null, ape: null, mail: null, fec: null };
// Callback cuando se lee el código QR
qrcode.callback = (respuesta) => {
  if (respuesta) {
    try {
      console.log('respuesta leida: ', respuesta);
      let parsedInfo = JSON.parse(respuesta);
      console.log(parsedInfo);
      parsedInfo = JSON.parse(parsedInfo.toString())
      console.log('Datos parseados de nuevo: ',parsedInfo);

      if (parsedInfo.uid && parsedInfo.name && parsedInfo.surname && parsedInfo.email && parsedInfo.date) {
        console.log('Inicia el escaneo???');
        setTimeout(() => {
        qrInfo = parsedInfo;
        Swal.fire("Registro exitoso");
        activarSonido();
        setTimeout(tomarFoto, 3000);
        resetearPrograma();
        setTimeout(cerrarModalLogQR, 7000);
        }, 10000);
      } else {
        throw new Error("Invalid QR structure");
      }
    } catch (error) {
      Swal.fire("Código QR no válido", "Por favor, escanee un código QR válido.", "error");
      resetearPrograma()
    }
  }
};

function cerrarModalLogQR() {
  const modal = document.getElementById("myModal");
  if (modal) {
    modal.style.display = "none";
  } else {
    console.error("modal no encontrado");
  }
}

function tomarFoto() {
  // Crear un nuevo canvas con el mismo tamaño que el video
  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var context = canvas.getContext('2d');

  // Dibujar la imagen del video en el canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Obtener la imagen como un data URL
  var foto = canvas.toDataURL('image/png');
  console.log("Foto tomada con éxito.");
  guardarFotoEnLocalStorage(foto);
  Swal.fire("Foto tomada con éxito");
  getPhotoFromLocalStorage(); //<================AQUI SE LLAMA DE UNA - lo he incluido aqui para completar el guardado a la BD
  setTimeout(resetearPrograma, 3000);
}


// Guardar foto en almacenamiento local del navegador
function guardarFotoEnLocalStorage(foto) {
  localStorage.setItem('fotoQR', foto);
  console.log("Imagen guardada en el almacenamiento local.");
}

// Resetear el programa para capturar otro QR
function resetearPrograma() {
  qrInfo = ''; // Resetear la información del QR
  encenderCamara(); // Volver a encender la cámara para capturar otro QR
}

// Evento para activar la cámara cuando la página se carga completamente
window.addEventListener('load', (e) => {
  encenderCamara();
});

let foto = null;

function getPhotoFromLocalStorage() {
  foto = localStorage.getItem("fotoQR");
  if (foto) {
    console.log(`![capturaLog.png](${foto})`);
  } else {
    console.log("No se encontró ninguna imagen en el Local Storage.");
  }
  localStorage.clear();
}

