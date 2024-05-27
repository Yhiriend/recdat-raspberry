document.getElementById("logqr").addEventListener("click", function () {
  document.getElementById("myModal").style.display = "block";
});

document
  .getElementsByClassName("close")[0]
  .addEventListener("click", function () {
    document.getElementById("myModal").style.display = "none";
  });

  //============================================================================
  document.getElementById("logmanual").addEventListener("click", function () {
    document.getElementById("myModalManual").style.display = "block";
  });
  
  document
    .getElementsByClassName("closeManual")[0]
    .addEventListener("click", function () {
      document.getElementById("myModalManual").style.display = "none";
    });

    var respuesta;
    var firstInputValue;

    document.getElementById("firstForm").addEventListener("submit", function (event) {
        event.preventDefault();

        firstInputValue = document.getElementById("id/email").value;
        console.log(firstInputValue);

        document.getElementById("firstForm").style.display = "none";
        document.getElementById("answerTheQuestion").style.display = "block";
      });

    document.getElementById("answerTheQuestion").addEventListener("click", function (event) {

        respuesta = document.getElementById("answer").value;

          var combinedValues = "Correo/ID: " + firstInputValue + "\n" + "Respuesta: " + respuesta;
          console.log(combinedValues);
      });