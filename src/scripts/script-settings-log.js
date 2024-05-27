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

