document.addEventListener('DOMContentLoaded', function() {
    let draftForm = document.getElementById('draftForm');

    if (draftForm) {
        draftForm.addEventListener('submit', function(event) {
            event.preventDefault();

            let error_container = document.getElementById('error_container');
            error_container.classList.add('d-none');

            try {
                let pokemonCards = document.querySelectorAll('.card-drafts .card-body');
                let pokemonData = [];

                pokemonCards.forEach(function(card) {
                    let pokemonElements = card.querySelectorAll('div[class*="row"]'); 
                    pokemonElements.forEach(function(element) {
                        let pokeName = element.querySelector('p').textContent.trim();
                        let pokemon = {
                            name: pokeName,
                            pointValue: element.querySelector('input[type="number"]').value,
                            isBanned: element.querySelector(`input[name="${pokeName}-banCheckbox"]`).checked,
                            isTeraBanned: element.querySelector(`input[name="${pokeName}-Teraban"]`) != null ? element.querySelector(`input[name="${pokeName}-Teraban"]`).checked : false
                        };
                        pokemonData.push(pokemon);
                    });
                });

                console.log(pokemonData);
                draftForm.submit();

            } catch (error) {
                console.log(error);
                error_container.textContent = error;
                error_container.classList.remove('d-none');
            }
        });
    }

    let draftCancelForm = document.getElementById('draftCancel');

    if (draftCancelForm) {
        draftCancelForm.addEventListener('submit', function(event) {
            event.preventDefault();
            draftCancelForm.submit();
        });
    }
});




