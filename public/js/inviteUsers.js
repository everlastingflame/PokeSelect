let inviteForm = document.getElementById('inviteForm');

if(inviteForm) {
    inviteForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let invitedPlayer = document.getElementById('username').value;

        try {
            invitedPlayer = checkUsername(invitedPlayer);
            // let requestConfig = {
            //     method: "POST",
            //     url: "#"
            // }
            // $.ajax(requestConfig).then(function (responseMessage) {
            //     if(responseMessage.error) {}
            // })
            inviteForm.submit();
        } catch (error) {
            /* const errorDiv = document.getElementById('error_output');
            errorDiv.style = "display: block";
            errorDiv.innerHTML = error;
            formIsValid = false; */
            error_container.textContent = error;
            error_container.style.display = 'block';
        }
    });
}

let draftFinal = document.getElementById('finishInvites');
if(draftFinal) {
    draftFinal.addEventListener('submit', function(event) {
        let path = window.location.pathname;
        path = path.substring(0, path.length - 7);
        draftFinal.action = path;
        draftFinal.submit();
    })
}


