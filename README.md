# PokeSelect

PokeSelect is the all-in-one application for Pokemon Draft League competitors. Users can choose any of the nine Pokemon generations for their draft, customize the settings for each Pokemon, and then invite their friends to join as the draft master. Once everyone has joined the league, each user selects Pokemon for their team in the draft, and all matches can then be reported on PokeSelect to keep track of the league.

## How to Use PokeSelect

After installing all of the necessary files, you can do the following to run PokeSelect:

Running the server
```
$ npm start
```

Seeding the database
```
$ npm run seed
```

## Features

- Create a draft with any of the nine Pokemon generations, invite other users to join, and begin a draft
- Customize the list of selectable Pokemon in a draft, including Pokemon bans and Tera bans (generation 9 only)
- Adjustable draft settings such as number of users, point budget, team size, draftable Pokemon, and Pokemon point values
- Draft board for all users in the draft displays the pick number, current round, and current player selecting a Pokemon, with Pokemon sorted by point value on the draft board
- User pages that display all teams for a user, and a visibility setting to toggle if a user's profile is public or private
- Diplays Pokemon information when hovering over them on the draft board
- Declaring Tera captains for a team after teams have been selected in the draft (generation 9 only)
- Tournament page for each draft to track wins and losses of each team in the league

### Created By: [Todd Bechtel](https://github.com/tbechtel40), [Charles Booth](https://github.com/everlastingflame), [Matthew Turner](https://github.com/mdt1026)