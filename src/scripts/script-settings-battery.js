navigator.getBattery().then(function (battery) {
  function updateBatteryStatus() {
    var level = battery.level * 100;
    var charging = battery.charging;

    var batteryIcon = document.getElementById("logosBWA");
    if (charging) {
      batteryIcon.src = "../img/transitions/battery_charging.svg";
    } else if (level >= 100) {
      batteryIcon.src = "../img/transitions/battery_full.svg";
    } else if (level >= 90) {
      batteryIcon.src = "../img/transitions/battery_5_bar.svg";
    } else if (level >= 80) {
      batteryIcon.src = "../img/transitions/battery_4_bar.svg";
    } else if (level >= 60) {
      batteryIcon.src = "../img/transitions/battery_3_bar.svg";
    } else if (level >= 40) {
      batteryIcon.src = "../img/transitions/battery_2_bar.svg";
    } else if (level >= 20) {
      batteryIcon.src = "../img/transitions/battery_1_bar.svg";
    } else if (level >= 10) {
      batteryIcon.src = "../img/transitions/battery_alert.svg";
    } else {
      batteryIcon.src = "../img/transitions/battery_error.svg";
    }
  }

  battery.addEventListener("levelchange", updateBatteryStatus);

  battery.addEventListener("chargingchange", updateBatteryStatus);

  updateBatteryStatus();
});

window.onload = function () {
  var batteryLevel = document.getElementById("level");
  var chargingStatus = document.getElementById("charging");
  var batteryTemperature = document.getElementById("temperature");

  navigator.getBattery().then(function (battery) {
    function updateBatteryStatus() {
      batteryLevel.textContent = Math.floor(battery.level * 100);
      chargingStatus.textContent = battery.charging
        ? "Cargando/Enchufado"
        : "Descargando/Desenchufado";
      batteryTemperature.textContent = battery.temperature
        ? battery.temperature.toFixed(2) + " °C"
        : "N/A";
    }

    updateBatteryStatus();

    battery.addEventListener("levelchange", updateBatteryStatus);
    battery.addEventListener("chargingchange", updateBatteryStatus);
    battery.addEventListener("temperaturechange", updateBatteryStatus);
  });
};

var batteryIcon = document.getElementById("logosBWA");

batteryIcon.addEventListener("click", function () {
  var modal = document.getElementById("myModalBattery");
  modal.style.display = "block";
  modal.style.transition = "scale(1.1)";

  var modalFrame = document.getElementById("modalFrameBattery");
  modalFrame.src = "../src/views/view-settings-battery.html";
});

var closeModal = document.getElementsByClassName("closeBattery")[0];

closeModal.addEventListener("click", function () {
  var modal = document.getElementById("myModalBattery");
  modal.style.display = "none";
});
