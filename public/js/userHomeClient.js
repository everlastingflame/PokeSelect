function showDrafts(){
    document.getElementById("DraftText").style.display = "block";
    document.getElementById("CreateDraft").style.display = "none";
    document.getElementById("Invites").style.display = "none";
}

function showCreate(){
    document.getElementById("DraftText").style.display = "none";
    document.getElementById("CreateDraft").style.display = "block";
    document.getElementById("Invites").style.display = "none";
}

function showInvite(){
    document.getElementById("DraftText").style.display = "none";
    document.getElementById("CreateDraft").style.display = "none";
    document.getElementById("Invites").style.display = "block";
}

function showLogout(){

}
