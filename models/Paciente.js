const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    cedula: { type: String, required: true },
    telefono: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true }, // <-- cambiar aquí
    sexo: { type: String, required: true },           // <-- agregar sexo
    direccion: { type: String, required: true }
});

module.exports = mongoose.model('Paciente', pacienteSchema);
