var settingIcon = document.getElementById('logosetting');

settingIcon.addEventListener('click', function() {

  var modal = document.getElementById('myModalLog');
  modal.style.display = 'block';

  // var modalFrame = document.getElementById('modalFrameLog');
  // modalFrame.src = '../src/views/view-settings-log.html';
});

var closeModal = document.getElementsByClassName('closeLog')[0];

closeModal.addEventListener('click', function() {
  var modal = document.getElementById('myModalLog');
  modal.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function () {
  const togglePasswordW = document.querySelector('.toggle-password-wifi');
  const passwordInputW = document.getElementById('passwordWifi');
  const hideW = "../img/hideWifi.svg";
  const nohideW = "../img/no_hideWifi.svg";

  togglePasswordW.addEventListener('click', function () {
      const type = passwordInputW.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInputW.setAttribute('type', type);
      this.src = type === 'password' ? nohideW : hideW;
  });
});
