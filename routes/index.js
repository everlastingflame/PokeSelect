import pokeRoutes from './poke.js';
import users from './user.js';
import draft from './draft.js';
const constructorMethod = (app) => {
  app.use('/', pokeRoutes);
  app.use('/', users);
  app.use('/draft', draft);
  app.use('*', (req, res) => {
    return res.status(404).render("userError", {title: 'Error', notFound: true});
  });
};

export default constructorMethod;
