document.getElementById("logqr").addEventListener("click", function () {
  document.getElementById("myModal").style.display = "block";
});

document
  .getElementsByClassName("close")[0]
  .addEventListener("click", function () {
    document.getElementById("myModal").style.display = "none";
  });

  document.getElementById("logmanual").addEventListener("click", function () {
    document.getElementById("myModalManual").style.display = "block";
  });
  
  document
    .getElementsByClassName("closeManual")[0]
    .addEventListener("click", function () {
      document.getElementById("myModalManual").style.display = "none";
        window.location.reload()
    });

    document.getElementById("closeQr").addEventListener("click", function () {
      document.getElementById("myModal").style.display = "none";
        window.location.reload()
    });

    var respuesta;
    var firstInputValue;

    document.getElementById("firstForm").addEventListener("submit", function (event) {
        event.preventDefault();

        firstInputValue = document.getElementById("id_email").value;
        console.log(firstInputValue);

        window.apiSendSetQuestion.sendEmailForQuestion(firstInputValue);
        
        window.apiSendSetQuestion.onEmailForQuestionReply((event, question) => {
          if (question !== null) {
            document.getElementById("labelQuestion").innerText = question;
          } else {
            document.getElementById("labelQuestion").innerText = "Pregunta no encontrada";
            setTimeout(() => {
              Swal.fire("Correo ingresado no válido", "Por favor, revisa la escritura o comunicate con el administrador", "error");
              setTimeout(() => {
                window.location.reload();
              }, 4000);
            }, 1500);
          }
        });

        document.getElementById("firstForm").style.display = "none";
        document.getElementById("answerTheQuestion").style.display = "block";
      });

    document.getElementById("answerTheQuestion").addEventListener("submit", function (event) {
      event.preventDefault();

      
        respuesta = document.getElementById("answer").value;

          var combinedValues = "Correo/ID: " + firstInputValue + "\n" + "Respuesta: " + respuesta;
          console.log(combinedValues);
          document.getElementById("answerTheQuestion").style.display = "none"
      });

      

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