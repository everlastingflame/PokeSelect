document.addEventListener("DOMContentLoaded", function () {
  let draftForm = document.getElementById("draftForm");

  if (draftForm) {
    draftForm.addEventListener("submit", function (event) {
      event.preventDefault();

      let error_container = document.getElementById("error_container");
      error_container.classList.add("d-none");

      try {
        let pokemonCards = document.querySelectorAll(".card-drafts .card-body");
        let pokemonData = [];

        pokemonCards.forEach(function (card) {
          let pokemonElements = card.querySelectorAll('div[class*="row"]');
          pokemonElements.forEach(function (element) {
            let pokeName = element.querySelector("p").textContent.trim();
            let pointVal = element.querySelector('input[type="number"]').value;
            if (pointVal < 0)
              throw "Point values must be 0 or a positive number";
            let pokemon = {
              name: pokeName,
              pointValue: pointVal,
              isBanned: element.querySelector(
                `input[name="${pokeName}-banCheckbox"]`
              ).checked,
              isTeraBanned:
                element.querySelector(`input[name="${pokeName}-teraBan"]`) !=
                null
                  ? element.querySelector(`input[name="${pokeName}-teraBan"]`)
                      .checked
                  : false,
            };
            pokemonData.push(pokemon);
          });
        });

        console.log(pokemonData);
        postData("#", pokemonData);
      } catch (error) {
        console.log(error);
        error_container.textContent = error;
        error_container.classList.remove("d-none");
      }
    });
  }

});

function postData(url, data) {
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (data, _textStatus) {
      if (data.redirect) {
        // data.redirect contains the string URL to redirect to
        window.location.replace(data.redirect);
      }
    },
    error: function () {
      console.log("Error");
    },
  });
  //   fetch(url, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Success:", data);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
}
