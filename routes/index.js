import pokeRoutes from './poke.js';
import users from './user.js';
const constructorMethod = (app) => {
  app.use('/', pokeRoutes);
  app.use('/', users);
  app.use('*', (req, res) => {
    return res.status(404).render("error", {title: 'Error', notFound: true});
  });
};

export default constructorMethod;
