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