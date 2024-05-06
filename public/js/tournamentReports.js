let tournamentForm = document.getElementById("tournamentForm");

if(draftForm) {
    draftForm.addEventListener('submit', function(event) {
        event.preventDefault();
        try {
            let team1 = document.getElementById('team1').value;
            let team2 = document.getElementById('team2').value;
            let winner = document.getElementById('winner').value;

            team1 = checkString(team1);
            team2 = checkString(team2);
            winner = checkNumber(winner);
        } catch (error) {
            /* const errorDiv = document.getElementById('error_output');
            errorDiv.style = "display: block";
            errorDiv.innerHTML = error;
            formIsValid = false; */
            error_container.textContent = error;
            error_container.classList.remove('d-none');
        }
    }
)}