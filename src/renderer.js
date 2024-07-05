
var user;
var pass;
var msg;

document.getElementById("formLogin").addEventListener("submit", function (event) {
  event.preventDefault();

  user = document.getElementById('username').value;
  pass = document.getElementById('password').value;

  if (user === "") {
    document.getElementById("username").setCustomValidity("Este campo es requerido.");
  }
  if (pass === "") {
    document.getElementById("password").setCustomValidity("Este campo es requerido.");
  }
  document.getElementById("username").reportValidity();
  document.getElementById("password").reportValidity();

  const auth = { usuario: user, contraseña: pass };
  console.log('datos de ususario: ', auth);
  window.api.sendAuth(auth);

});

document.getElementById("username").addEventListener("input", function () {
  this.setCustomValidity('');
  this.reportValidity();
});

document.getElementById("poweroff").addEventListener("click", function (event) {
  msg = "apagando en 5 segundos..."
  window.apiPowerOff.sendConfirmationPower(msg);
});


window.apiValidateLogin.onLoginResult((event, result) => {
  if (result.success) {
    console.log('Login successful, usuario: ', result.user, '\nrol: ', result.role);
    document.getElementById('user').textContent = result.user;
    document.getElementById('role').textContent = result.role;
    document.getElementById('login').style.display = 'none';
    document.getElementById('logued').style.display = 'block';
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    document.getElementById("sync").disabled = false;
    document.getElementById("poweroff").disabled = false;
  } else {
    console.log('Login failed');
    document.getElementById('username').setCustomValidity('Usuario o contraseña incorrectos');
    document.getElementById('username').reportValidity();
  }

  document.getElementById('logout-button').addEventListener('click', function (event) {

    document.getElementById('login').style.display = 'block';
    document.getElementById('logued').style.display = 'none';
    document.getElementById('user').textContent = '';
    document.getElementById('role').textContent = '';

    document.getElementById("sync").disabled = true;
    document.getElementById("poweroff").disabled = true;
  })

});

document.getElementById("sync").disabled = true;
document.getElementById("poweroff").disabled = true;

document.getElementById("sync").addEventListener('click', function (event) {
  const sms = 'sync confirmed'
  window.apiSendEventSync.sendConfirmationSyncronization(sms);

  window.apiSendEventSync.onAssistanceReplySync((event, response) => {
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

})

document.addEventListener('DOMContentLoaded', () => {
  const listNetworksButton = document.getElementById('net');
  const wifiList = document.getElementById('wifi-networks');
  const connectButton = document.getElementById('connect');
  const ssidInput = document.getElementById('ssid');
  const passwordInput = document.getElementById('passwordWifi');

  listNetworksButton.addEventListener('click', async () => {
    document.getElementsByClassName('bloqForNet')[0].style.display = 'none';
    document.getElementById('listwifi').style.display = 'block';
    document.getElementsByClassName('modal-content-Network')[0].style.height = '85%';

    try {
      const networks = await window.wifiAPI.listNetworks();
      wifiList.innerHTML = '';
      networks.forEach(network => {
        const li = document.createElement('li');
        li.textContent = `${network.ssid} (${network.quality}%)`;
        wifiList.appendChild(li);
      });
    } catch (error) {
      console.error('Error al listar redes WiFi:', error);
    }
  });

  connectButton.addEventListener('click', async () => {
    const ssid = ssidInput.value;
    const password = passwordInput.value;

    if (!ssid || !password) {
      Swal.fire({
        title: 'Por favor, ingrese tanto el SSID como la contraseña.',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
      return;
    }

    // document.getElementById('connect').disabled = true;
    // document.getElementById('ssid').disabled = true;
    // document.getElementById('passwordWifi').disabled = true;

    try {
      await window.wifiAPI.connect(ssid, password);
      Swal.fire({
        title: 'Conectado exitosamente a la red WiFi',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    ssidInput.value = "";
    passwordInput.value = "";
      //alert('Conectado exitosamente a la red WiFi');
    } catch (error) {
      console.error('Error al conectarse a la red WiFi:', error);
      Swal.fire({
        title: 'Error al conectarse a la red WiFi',
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    ssidInput.value = "";
    passwordInput.value = "";
      //alert('Error al conectarse a la red WiFi');
    } finally {
      document.getElementById('connect').enabled = false;
      document.getElementById('ssid').enabled = false;
      document.getElementById('passwordWifi').enabled = false;
    }
  });
});

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('focus', () => {
    console.log('enviando mensaje para abrir el teclado...');
    const m = "lanza el teclado virtual... XD";
    window.apiLaunchKeyBoard.launchKeyboard(m);
  });
});

