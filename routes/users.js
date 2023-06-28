const { MongoClient } = require('mongodb');
const  config  = require('../config');
const bcrypt = require('bcrypt');

const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  getUsers,
} = require('../controller/users');

const initAdminUser = async (app, next) => {
  const { adminEmail, adminPassword, dbUrl } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    roles: { admin: true },
  };

  try {
    const client = new MongoClient(dbUrl);
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: adminUser.email });
    console.log(!user)
    if (!user) {
      await usersCollection.insertOne(adminUser);
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    client.close();
    return next();
  } catch (err) {
    console.error(err);
    next(err);
  }
}

/*
 * Diagrama de flujo de una aplicación y petición en node - express :
 *
 * request  -> middleware1 -> middleware2 -> route
 *                                             |
 * response <- middleware4 <- middleware3   <---
 *
 * la gracia es que la petición va pasando por cada una de las funciones
 * intermedias o "middlewares" hasta llegar a la función de la ruta, luego esa
 * función genera la respuesta y esta pasa nuevamente por otras funciones
 * intermedias hasta responder finalmente a la usuaria.
 *
 * Un ejemplo de middleware podría ser una función que verifique que una usuaria
 * está realmente registrado en la aplicación y que tiene permisos para usar la
 * ruta. O también un middleware de traducción, que cambie la respuesta
 * dependiendo del idioma de la usuaria.
 *
 * Es por lo anterior que siempre veremos los argumentos request, response y
 * next en nuestros middlewares y rutas. Cada una de estas funciones tendrá
 * la oportunidad de acceder a la consulta (request) y hacerse cargo de enviar
 * una respuesta (rompiendo la cadena), o delegar la consulta a la siguiente
 * función en la cadena (invocando next). De esta forma, la petición (request)
 * va pasando a través de las funciones, así como también la respuesta
 * (response).
 */

/** @module users */
module.exports = (app, next) => {
  /**
   * @name GET /users
   * @description Lista usuarias
   * @path {GET} /users
   * @query {String} [page=1] Página del listado a consultar
   * @query {String} [limit=10] Cantitad de elementos por página
   * @header {Object} link Parámetros de paginación
   * @header {String} link.first Link a la primera página
   * @header {String} link.prev Link a la página anterior
   * @header {String} link.next Link a la página siguiente
   * @header {String} link.last Link a la última página
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @response {Array} users
   * @response {String} users[]._id
   * @response {Object} users[].email
   * @response {Object} users[].roles
   * @response {Boolean} users[].roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin
   */
  app.get('/users', /* requireAdmin, */ getUsers);

  /**
   * @name GET /users/:uid
   * @description Obtiene información de una usuaria
   * @path {GET} /users/:uid
   * @params {String} :uid `id` o `email` de la usuaria a consultar
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a consultar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  app.get('/users/:uid', requireAuth, (req, resp) => {
  });

  /**
   * @name POST /users
   * @description Crea una usuaria
   * @path {POST} /users
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si ya existe usuaria con ese `email`
   */
  app.post('/users', requireAdmin, async (req, resp, next) => {
    // TODO: implementar la ruta para agregar
    // nuevos usuarios
/*     const { email, password, roles } = req.body;

  if (!email || !password) {
    return next(400);
  }
  console.log("hola mundo 2");
  console.log(config);
  const client = new MongoClient(config.dbUrl);
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db();
  console.log('no');
  const usersCollection = db.collection('users');
  console.log('noo');
  // the following code examples can be pasted here...
  const newUser = {
    email,
    password: bcrypt.hashSync(password, 10),
    roles: roles || {},
  };

  const insertedUser = await usersCollection.insertOne(newUser);
  console.log(insertedUser);
  await client.close();
  console.log('nooo');
  resp.status(200).json({
    _id: insertedUser.insertedId,
    email: insertedUser.email,
    roles: insertedUser.roles,
  }); */
  /* return next(200); */
/*   console.log(config.dbUrl);
  client.connect(async (err) => {
    try {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return next(500);
    }
    console.log("hola mundo 4");
    const db = client.db();
    console.log("hola mundo 5");
    const usersCollection = db.collection('users');
    console.log("hola mundo 3");
    // Verificar si ya existe una usuaria con el mismo email
    usersCollection.findOne({ email }, (err, existingUser) => {
      if (err) {
        console.error('Error al buscar la usuaria:', err);
        client.close();
        return next(500);
      }

      if (existingUser) {
        client.close();
        return next(403);
      }

      const newUser = {
        email,
        password: bcrypt.hashSync(password, 10),
        roles: roles || {},
      };

      usersCollection.insertOne(newUser, (err, result) => {
        if (err) {
          console.error('Error al agregar la usuaria:', err);
          client.close();
          return next(500);
        }

        const insertedUser = result.ops[0];
        client.close();
        resp.status(201).json({
          _id: insertedUser._id,
          email: insertedUser.email,
          roles: insertedUser.roles,
        });
      });
    });
  }
  catch (err) {
    console.log(err);
  }
  });
  console.log("no connect") */
  });

  /**
   * @name PUT /users
   * @description Modifica una usuaria
   * @params {String} :uid `id` o `email` de la usuaria a modificar
   * @path {PUT} /users
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a modificar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {403} una usuaria no admin intenta de modificar sus `roles`
   * @code {404} si la usuaria solicitada no existe
   */
  app.put('/users/:uid', requireAuth, (req, resp, next) => {
  });

  /**
   * @name DELETE /users
   * @description Elimina una usuaria
   * @params {String} :uid `id` o `email` de la usuaria a modificar
   * @path {DELETE} /users
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a eliminar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  app.delete('/users/:uid', requireAuth, (req, resp, next) => {
  });

  initAdminUser(app, next);
};
