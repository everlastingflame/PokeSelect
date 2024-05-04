let inviteForm = document.getElementById('inviteForm');

if(inviteForm) {
    inviteForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let error_container = document.getElementById('error_container');
        error_container.classList.add('d-none');

        let invitedPlayer = document.getElementById('invites').value;

        try {
            invitedPlayer = checkString(invitedPlayer);
            inviteForm.submit();
        } catch (error) {
            /* const errorDiv = document.getElementById('error_output');
            errorDiv.style = "display: block";
            errorDiv.innerHTML = error;
            formIsValid = false; */
            error_container.textContent = error;
            error_container.classList.remove('d-none');
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


