
function updateNetworkStatus() {
  var wifiIcon = document.getElementById("wifiIcon");

  if (navigator.onLine) {
    fetch("https://www.google.com/favicon.ico", { mode: 'no-cors' })
      .then(function(response) {
        wifiIcon.src = "../img/netstate/wifi2.svg";
      })
      .catch(function(error) {
        wifiIcon.src = "../img/netstate/offline.svg";
      });
  } else {
    wifiIcon.src = "../img/netstate/wifi_off.svg";
  }
}

window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

updateNetworkStatus();


var wifiIcon = document.getElementById('wifiIcon');

wifiIcon.addEventListener('click', function() {

  var modal = document.getElementById('myModalNetwork');
  modal.style.display = 'block';

});

var closeModal = document.getElementsByClassName('closeNetwork')[0];

closeModal.addEventListener('click', function() {
  var modal = document.getElementById('myModalNetwork');
  modal.style.display = 'none';

  document.getElementsByClassName('bloqForNet')[0].style.display = 'block';
     document.getElementById('listwifi').style.display = 'none';
     document.getElementsByClassName('modal-content-Network')[0].style.height = '62%';
     document.getElementsByClassName('bloqForNet')[0].style.translate = '9%';
     document.getElementById('bloqlognet').style.translate = '56%';
});

document.getElementById('arrow-back').addEventListener('click', function() {
  document.getElementsByClassName('bloqForNet')[0].style.display = 'block';
  document.getElementById('listwifi').style.display = 'none';
  document.getElementsByClassName('modal-content-Network')[0].style.height = '62%';
  document.getElementsByClassName('bloqForNet')[0].style.translate = '9%';
  document.getElementById('bloqlognet').style.translate = '56%';
});

document.addEventListener('DOMContentLoaded', function () {
  const togglePassword = document.querySelector('.toggle-password');
  const passwordInput = document.getElementById('password');
  const hide = "../img/hide.svg";
  const nohide = "../img/no_hide.svg";

  togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.src = type === 'password' ? nohide : hide;
  });
});

document.getElementById('sync').addEventListener('click', function () {
  var button = document.getElementById("sync");
  button.disabled = true;

  var loaderContainer = document.getElementById("loader").parentNode;
  loaderContainer.style.display = "flex";

  button.style.color = "#797979";

  setTimeout(function () {
    button.disabled = false;
    loaderContainer.style.display = "none";
    button.style.color = "";
  }, 5000);
});

