function showDrafts(){
    document.getElementById("DraftText").style.display = "block";
    document.getElementById("CreateDraft").style.display = "none";
    document.getElementById("Invites").style.display = "none";
    document.getElementById("Visibility").style.display = "none";
}

function showCreate(){
    document.getElementById("DraftText").style.display = "none";
    document.getElementById("CreateDraft").style.display = "block";
    document.getElementById("Invites").style.display = "none";
    document.getElementById("Visibility").style.display = "none";
}

function showInvite(){
    document.getElementById("DraftText").style.display = "none";
    document.getElementById("CreateDraft").style.display = "none";
    document.getElementById("Invites").style.display = "block";
    document.getElementById("Visibility").style.display = "none";
}

function showVisibility(){
    document.getElementById("DraftText").style.display = "none";
    document.getElementById("CreateDraft").style.display = "none";
    document.getElementById("Invites").style.display = "none";
    document.getElementById("Visibility").style.display = "block";
}

function showLogout(){

}

const checkString = (str) => {
    if (typeof str !== 'string') {
        throw 'is not a string';
    }
    if (str.trim() === '') {
        throw 'is an empty string';
    }
    if(!str){
        throw 'is undefined';
    }
    return str;
}

function checkNumber(number, name = "number") {
    if (!number) {
      throw `Error: Did not supply ${name}`;
    }
    if (typeof number !== "number" || Number.isNaN(number)) {
      throw `Error: ${name} is type [${typeof number}], not number`;
    }
    return number;
  }

let draftForm = document.getElementById('draftForm');

function teraCheck(gen) {
    if(gen.value === "gen9") {
        document.getElementById("teraDiv").style.display = "block";
    } else {
        document.getElementById("teraDiv").style.display = "none";
    }
}

if(draftForm) {
    draftForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let error_container = document.getElementById('error_container');
        error_container.classList.add('d-none');

        let generation = document.getElementById('generation').value;
        let pointBudget = document.getElementById('pointBudget').value;
        let teamSize = document.getElementById('teamSize').value;
        let teraCaptain = 0;

        try {
            generation = checkString(generation);
            pointBudget = checkNumber(parseInt(pointBudget));
            if(pointBudget < 6) throw "Point budget must be at least 6 points";
            teamSize = checkNumber(parseInt(teamSize));
            if(teamSize < 6) throw "Team size must be at least 6 Pokemon";
            if(generation === "gen9") {
                teraCaptain = document.getElementById('teraCaptain').value;
                teraCaptain = checkNumber(parseInt(teraCaptain));
                if(teraCaptain < 0) throw "Number of tera captains must be 0 or a positive number"
                if(teraCaptain > teamSize) throw "Number of tera captains must be less than or equal to the team size";
            }
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

let visibilityForm = document.getElementById("visibilityForm");

if(visibilityForm) {
    visibilityForm.addEventListener('submit', function(event) {
        event.preventDefault();

        try {
            let visibility = document.getElementById('visibility').value;
            visibility = checkString(visibility);
            if(visibility != "public" && visibility != "private") throw "Profile visibility must be set to either public or private";
            visibilityForm.submit();
        } catch (e) {
            /* error_container.textContent = error;
            error_container.classList.remove('d-none'); */
        }
    })

}
