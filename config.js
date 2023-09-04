exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = process.env.MONGO_URL || process.env.DB_URL || 'mongodb+srv://rcum22:lT2QSdu4VmhYr5Am@cluster0.zmushmp.mongodb.net/BQA-Risell';
exports.secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';
exports.adminEmail = process.env.ADMIN_EMAIL || 'pruebaadmin@localhost';
exports.adminPassword = process.env.ADMIN_PASSWORD || 'changeme1234';
