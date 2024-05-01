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

const checkUsername = (username) => {
    username = username.trim();

    try{
        checkString(username);
    }
    catch(e){
        throw(`Username ${e}`);
    }

    if(username.length < 3){
        throw('Username is too short');
    }
    if(username.length > 10){
        throw('Username is too long');
    }
    username = username.toLowerCase();
    return username;
}

const checkPassword = (password) => {
    password = password.trim();

    try{
        checkString(password);
    }
    catch(e){
        throw(`Password ${e}`);
    }

    if(password.length < 8){
        throw('Password is too short');
    }
    if(!/\d/.test(password)){
        throw('Password must contain a number');
    }
    if(!/[-!@#$%^&*()_+{}:"<>?=[\],./\\';`~]/.test(password)){
        throw('Password must contain a special character');
    }    
    if(!/[A-Z]/.test(password)){
        throw('Password must contain an uppercase letter');
    }
    return password;
}

const checkEmail = (email) => {
    email = email.trim();

    try{
        checkString(email);
    }
    catch(e){
        throw(`Email ${e}`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw('Invalid email format');
    }

    return email;
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


function validateDate(date, name = "date") {
  date = checkString(date);

  const _day = dayjs(date, "YYYY-MM-DD"); //updated because registerform likes using year month day for some reason
  if (!_day.isValid()) {
    throw `Error: ${date} is invalid`;
  }
  if (_day.isAfter(dayjs(), "day")) {
    throw `Error: ${date} cannot be in the future`;
  }
  if (dayjs().diff(_day, "year") < 13) {
    throw `Error: ${date} user must be at least 13 years old`;
  }
  if (dayjs().diff(_day, "year") > 100) {
    throw `Error: ${date} date of birth is too old`;
  }

  return date;
}

const loginForm = document.getElementById('signin-form');

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let formIsValid = true;
        try {
            username = checkUsername(username);
            password = checkPassword(password);
        } catch (error) {
            error = "Either the username or password is invalid. - 400"
            const errorDiv = document.getElementById('error_output');
            errorDiv.style = "display: block";
            errorDiv.innerHTML = error;
            formIsValid = false;
        }

        if (formIsValid) {
            loginForm.submit();
        }
    });
}


let registerForm = document.getElementById('signup-form');

if(registerForm){
    dob.max = new Date().toISOString().split("T")[0];
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let confirmPassword = document.getElementById('confirmPassword').value;
        let email = document.getElementById('email').value;
        let formIsValid = true;
        let dob = document.getElementById('dob').value;

        try {
            username = checkUsername(username);
            password = checkPassword(password);
            confirmPassword = checkPassword(confirmPassword);
            email = checkEmail(email);
            dob = validateDate(dob, "dob");

            if(password !== confirmPassword){
                throw 'Passwords do not match';
            }
        } catch (error) {
            const errorDiv = document.getElementById('error_output');
            errorDiv.style = "display: block";
            errorDiv.innerHTML = error;
            formIsValid = false;
        }
        if(formIsValid){
            registerForm.submit();
        }
    });
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
        let generation = document.getElementById('generation').value;
        let pointBudget = document.getElementById('pointBudget').value;
        let teamSize = document.getElementById('teamSize').value;
        let teraCaptain = 0;

        let formIsValid = true;

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
        } catch (error) {
            /* const errorDiv = document.getElementById('error_output');
            errorDiv.style = "display: block";
            errorDiv.innerHTML = error;
            formIsValid = false; */
            console.log(error);
        }
        if(formIsValid){
            draftForm.submit();
        }
    });
}