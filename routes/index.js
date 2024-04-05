import pokeRoutes from './poke.js';
const constructorMethod = (app) => {
  app.use('/', pokeRoutes);
  app.use('*', (req, res) => {
    return res.status(404).render("Error", {title: 'Error', notFound: true});
  });
};

export default constructorMethod;
