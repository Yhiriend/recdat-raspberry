
const video = document.createElement("video");

const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

const btnScanQR = document.getElementById("btn-scan-qr");

const blurredCanvasElement = document.createElement('canvas');
const blurredCanvas = blurredCanvasElement.getContext('2d');

let scanning = false;

let qrInfo = '';

function encenderCamara () {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      scanning = true;
      btnScanQR.hidden = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true);
      video.srcObject = stream;
      video.play();
      tick();
      scan();
    });
};

// function tick() {
//   canvasElement.height = video.videoHeight;
//   canvasElement.width = video.videoWidth;
  
//   canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);

//   const frameWidth = 300;
//   const frameHeight = 300;
//   const cornerRadius = 20;
//   const cornerLength = 40;
//   const lineWidth = 6;
//   const frameX = (canvasElement.width - frameWidth) / 2;
//   const frameY = (canvasElement.height - frameHeight) / 2;
//   const frameColor = "#009933";

//   canvas.save();
  
//   canvas.filter = 'blur(8px)';
//   canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
//   canvas.restore();

//   canvas.save();
//   canvas.beginPath();
//   canvas.moveTo(frameX, frameY);
//   canvas.lineTo(frameX + frameWidth, frameY);
//   canvas.lineTo(frameX + frameWidth, frameY + frameHeight);
//   canvas.lineTo(frameX, frameY + frameHeight);
//   canvas.closePath();
//   canvas.clip();
//   canvas.filter = 'none';
//   canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
//   canvas.restore();

//   canvas.strokeStyle = frameColor;
//   canvas.lineWidth = lineWidth;

//   canvas.beginPath();
//   canvas.moveTo(frameX + cornerRadius, frameY);
//   canvas.lineTo(frameX + cornerLength, frameY);
//   canvas.arcTo(frameX, frameY, frameX, frameY + cornerRadius, cornerRadius);
//   canvas.lineTo(frameX, frameY + cornerLength);
//   canvas.stroke();

//   canvas.beginPath();
//   canvas.moveTo(frameX + frameWidth - cornerLength, frameY);
//   canvas.lineTo(frameX + frameWidth - cornerRadius, frameY);
//   canvas.arcTo(frameX + frameWidth, frameY, frameX + frameWidth, frameY + cornerRadius, cornerRadius);
//   canvas.lineTo(frameX + frameWidth, frameY + cornerLength);
//   canvas.stroke();

//   canvas.beginPath();
//   canvas.moveTo(frameX, frameY + frameHeight - cornerLength);
//   canvas.lineTo(frameX, frameY + frameHeight - cornerRadius);
//   canvas.arcTo(frameX, frameY + frameHeight, frameX + cornerRadius, frameY + frameHeight, cornerRadius);
//   canvas.lineTo(frameX + cornerLength, frameY + frameHeight);
//   canvas.stroke();

//   canvas.beginPath();
//   canvas.moveTo(frameX + frameWidth - cornerLength, frameY + frameHeight);
//   canvas.lineTo(frameX + frameWidth - cornerRadius, frameY + frameHeight);
//   canvas.arcTo(frameX + frameWidth, frameY + frameHeight, frameX + frameWidth, frameY + frameHeight - cornerRadius, cornerRadius);
//   canvas.lineTo(frameX + frameWidth, frameY + frameHeight - cornerLength);
//   canvas.stroke();

//   if (scanning) {
//     requestAnimationFrame(tick);
//   }
// }
function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  
  canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);

  const frameWidth = 300;
  const frameHeight = 300;
  const cornerRadius = 20;
  const cornerLength = 40;
  const lineWidth = 6;
  const frameX = (canvasElement.width - frameWidth) / 2;
  const frameY = (canvasElement.height - frameHeight) / 2;
  const frameColor = "#009933";

  // Dibujar el video
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

  // Crear la máscara negra
  canvas.save();
  canvas.fillStyle = 'rgba(0, 0, 0, 0.4)';
  canvas.fillRect(0, 0, canvasElement.width, canvasElement.height);
  canvas.restore();

  // Dibujar el área transparente para la ventana del video
  canvas.save();
  canvas.beginPath();
  canvas.moveTo(frameX, frameY);
  canvas.lineTo(frameX + frameWidth, frameY);
  canvas.lineTo(frameX + frameWidth, frameY + frameHeight);
  canvas.lineTo(frameX, frameY + frameHeight);
  canvas.closePath();
  canvas.clip();
  canvas.clearRect(frameX, frameY, frameWidth, frameHeight);
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  canvas.restore();

  // Dibujar las esquinas del marco
  canvas.strokeStyle = frameColor;
  canvas.lineWidth = lineWidth;

  canvas.beginPath();
  canvas.moveTo(frameX + cornerRadius, frameY);
  canvas.lineTo(frameX + cornerLength, frameY);
  canvas.arcTo(frameX, frameY, frameX, frameY + cornerRadius, cornerRadius);
  canvas.lineTo(frameX, frameY + cornerLength);
  canvas.stroke();

  canvas.beginPath();
  canvas.moveTo(frameX + frameWidth - cornerLength, frameY);
  canvas.lineTo(frameX + frameWidth - cornerRadius, frameY);
  canvas.arcTo(frameX + frameWidth, frameY, frameX + frameWidth, frameY + cornerRadius, cornerRadius);
  canvas.lineTo(frameX + frameWidth, frameY + cornerLength);
  canvas.stroke();

  canvas.beginPath();
  canvas.moveTo(frameX, frameY + frameHeight - cornerLength);
  canvas.lineTo(frameX, frameY + frameHeight - cornerRadius);
  canvas.arcTo(frameX, frameY + frameHeight, frameX + cornerRadius, frameY + frameHeight, cornerRadius);
  canvas.lineTo(frameX + cornerLength, frameY + frameHeight);
  canvas.stroke();

  canvas.beginPath();
  canvas.moveTo(frameX + frameWidth - cornerLength, frameY + frameHeight);
  canvas.lineTo(frameX + frameWidth - cornerRadius, frameY + frameHeight);
  canvas.arcTo(frameX + frameWidth, frameY + frameHeight, frameX + frameWidth, frameY + frameHeight - cornerRadius, cornerRadius);
  canvas.lineTo(frameX + frameWidth, frameY + frameHeight - cornerLength);
  canvas.stroke();

  if (scanning) {
    requestAnimationFrame(tick);
  }
}


function scan() {
  try {
    qrcode.decode();
  } catch (e) {
    setTimeout(scan, 300);
  }
}

const cerrarCamara = () => {
  video.srcObject.getTracks().forEach((track) => {
    track.stop();
  });
  canvasElement.hidden = true;
  btnScanQR.hidden = false;
};

const activarSonido = () => {
  var audio = document.getElementById("audioScaner");
  audio.play();
};

let foto;

function tomarFoto() {
  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var context = canvas.getContext('2d');

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  var foto = canvas.toDataURL('image/jpg');
  console.log("Foto tomada con éxito.");

  guardarFotoEnLocalStorage(foto);

  //getPhotoFromLocalStorage();

  Swal.fire({
    title: 'Foto tomada con éxito',
    timer: 2000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  setTimeout(resetearPrograma, 3000);
}

function guardarFotoEnLocalStorage(foto) {
  localStorage.setItem('fotoQR', foto);
}

function getPhotoFromLocalStorage() {
  foto = localStorage.getItem("fotoQR");
  setTimeout(() => {
    localStorage.clear()
  }, 5000);
  return foto;
}

function getFormattedDateNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

let isScanning = true;

qrcode.callback = (respuesta) => {
  if (!isScanning) return;

  if (respuesta) {
    try {
      let parsedInfo = JSON.parse(respuesta);
      parsedInfo = JSON.parse(parsedInfo.toString())

       if (parsedInfo.uid && parsedInfo.name && parsedInfo.surname && parsedInfo.email && parsedInfo.date) {

        const nowDate = getFormattedDateNow();
        const dt = parsedInfo.date;
        const dateReceived = dt.split(' ')[0];
        
        if (dateReceived === nowDate) {
          isScanning = false;

          qrInfo = parsedInfo;
            Swal.fire({
            title: "Escaneado con exito",
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          activarSonido();
          setTimeout(tomarFoto, 4000);
          resetearPrograma();
          
          setTimeout(cerrarModalLogQR, 7000);
  
          setTimeout(() => {
            const url = getPhotoFromLocalStorage();
            console.log('esta es la foto url capturada: \n', url);
  
            parsedInfo.url = url;
            window.apiSaveToDatabase.catchResultScanned(parsedInfo);
          }, 5000);
  
          window.apiSaveToDatabase.onAssistanceReply((event, response) => {
            if (!response.success) {
              Swal.fire({
                title: response.message,
                icon: 'warning',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                  Swal.getHtmlContainer().querySelector('i.swal2-icon').classList.add('swal2-icon-warning');
                }
              });                    
  
              setTimeout(() => {
                window.location.reload();
              }, 3000);
  
            } else {
              Swal.fire({
                title: response.message,
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                  Swal.getHtmlContainer().querySelector('i.swal2-icon').classList.add('swal2-icon-success');
                }
              });
  
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            }
          });
  
          cerrarCamara();
  
          setTimeout(() => {
            isScanning = true;
          }, 10000);
        } else {
          Swal.fire({
            title: 'Este codigo QR ya ha expirado!',
            icon: 'warning',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.getHtmlContainer().querySelector('i.swal2-icon').classList.add('swal2-icon-warning');
            }
          });                       

        setTimeout(() => {
            window.location.reload();
        }, 3000);
        }
      } else {
        throw new Error("Invalid QR structure");
      }
    } catch (error) {
      Swal.fire("Código QR no válido", "Por favor, escanee un código QR válido.", "error");
      resetearPrograma();
      isScanning = true;
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

function resetearPrograma() {
  qrInfo = '';
  encenderCamara();
}

document.getElementById('logqr').addEventListener('click', function (event){
  encenderCamara();
})
