// const bcrypt = require('bcrypt');
// eslint-disable-next-line import/extensions
// const User = require('../modules/users.js');
// const { isAdmin } = require('../middleware/auth.js');

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implementa la función necesaria para traer la colección `users`
    // establecemos la cantidad de paginas y el limite de usuarios
    // const page = req.body.page || 1;
    // console.log(page);
    // const userLimit = req.body.limit || 10;
    // // con el metodo select y el sgino de menos excluimos la constraseña y version
    // // porque no queremos que se muestre en el resultado de la consulta
    // const usersList = await User.find({})
    //   .select('-password -__v')
    //   .skip((page - 1) * userLimit)
    //   .limit(userLimit);
    // if (req.user.rol === 'admin') {
    //   resp.json(usersList);
    // }
    // next();
  },
};
