const videoManual = document.getElementById('videoManual');
const canvasManual = document.getElementById('canvasManual');
const context = canvasManual.getContext('2d');
let scanningManual = false;

function encenderCamaraManual() {
    navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then(function (stream) {
            scanningManual = true;
            videoManual.srcObject = stream;
            videoManual.play();
        })
        .catch(function (err) {
            console.error("Error al acceder a la cámara: ", err);
        });

    setTimeout(() => {
        tomarFotoManual();
    }, 5000);
}

function tomarFotoManual() {
    canvasManual.width = videoManual.videoWidth;
    canvasManual.height = videoManual.videoHeight;
    context.drawImage(videoManual, 0, 0, canvasManual.width, canvasManual.height);

    const fotoManual = canvasManual.toDataURL('image/jpg');
    console.log("Foto tomada con éxito.");

    guardarFotoManualEnLocalStorage(fotoManual);

    Swal.fire({
        title: 'Foto tomada con éxito',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    registerAssistanceManual();
    
    cerrarCamaraManual();

    setTimeout(() => {
        resetLogManual();
    }, 10000);

}

function guardarFotoManualEnLocalStorage(fotoManual) {
    localStorage.setItem('fotoManual', fotoManual);
}

function getPhotoManualFromLocalStorage() {
    const fotoManual = localStorage.getItem("fotoManual");
    setTimeout(() => {
        localStorage.clear();
    }, 5000);
    return fotoManual;
}

function cerrarCamaraManual() {
    videoManual.srcObject.getTracks().forEach((track) => {
        track.stop();
    });
    canvasManual.hidden = true;    
}

function resetLogManual() {
    document.getElementById("firstForm").style.display = "block";
    document.getElementById("myModalManual").style.display = "none";
}

document.getElementById('answerTheQuestion').addEventListener('submit', function () {
    document.getElementById("bloqlog-manual").style.display = "none"
        document.getElementById("takePhoto").style.display = "block"

    encenderCamaraManual();
});

document.getElementById('closeManualWindow').addEventListener('click', function () {
    
    document.getElementById("bloqlog-manual").style.display = "block"
    document.getElementById("bloqlog-manual").style.translate = "51%"
    document.getElementById('answerTheQuestion').style.display = "none"
    document.getElementById("takePhoto").style.display = "none"
    document.getElementById("firstForm").style.display = "block";
    cerrarCamaraManual();
});

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function registerAssistanceManual() {
    const inputemail = document.getElementById("id_email").value;
    const inputanswer = respuesta = document.getElementById("answer").value;

    const email = inputemail;
    const entry_date = getFormattedDate();
    const answer = inputanswer;

    const photo = getPhotoManualFromLocalStorage();

    const data = { email, entry_date, answer, photo };
    console.log('datos a enviar del registro manual:\n', data);

    setTimeout(() => {
        window.apiSaveToDatabasManual.catchResultManual(data)
    }, 5000);

    window.apiSaveToDatabasManual.onAssistanceReplyManual((event, response) => {
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

}

