
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

  document.getElementById("poweroff").addEventListener("click", function (event){
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
      document.getElementById("net").disabled = false;
      document.getElementById("poweroff").disabled = false;
    } else {
      console.log('Login failed');
      document.getElementById('username').setCustomValidity('Usuario o contraseña incorrectos');
      document.getElementById('username').reportValidity();
    }

    document.getElementById('logout-button').addEventListener('click', function (event){
      
      document.getElementById('login').style.display = 'block';
      document.getElementById('logued').style.display = 'none';
      document.getElementById('user').textContent = '';
      document.getElementById('role').textContent = '';

      document.getElementById("sync").disabled = true;
      document.getElementById("net").disabled = true;
      document.getElementById("poweroff").disabled = true;
    })

  });

  document.getElementById("sync").disabled = true;
  document.getElementById("net").disabled = true;
  document.getElementById("poweroff").disabled = true;


