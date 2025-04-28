// crearUsuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('./models/Usuario');

// Tu URL de conexión a MongoDB Atlas
const uri = 'mongodb+srv://admin:1234@cluster0.hdasq8z.mongodb.net/miSistema?retryWrites=true&w=majority&appName=Cluster0';

// Conexión a la base de datos
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Conectado a MongoDB para crear usuario');

    try {
      const contraseñaHash = await bcrypt.hash('1234', 10); // Aquí defines la contraseña que quieras

      const nuevoUsuario = new Usuario({
        usuario: 'admin2',    // Nuevo usuario
        nombre: 'Administrador 2', // Nombre visible
        contraseña: contraseñaHash
      });

      await nuevoUsuario.save();
      console.log('✅ Usuario creado exitosamente');
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error);
  });
