let draftForm = document.getElementById('draftForm');

if(draftForm) {
    draftForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let error_container = document.getElementById('error_container');
        error_container.classList.add('d-none');

        let pokemonBanned = document.getElementById('pokemonBanned').value;
        // if gen 9, teraBanned

        try {
            pokemonBanned = checkString(pokemonBanned);


            draftForm.submit();
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

