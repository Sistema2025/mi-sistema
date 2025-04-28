// models/Consulta.js

const mongoose = require('mongoose');

const ConsultaSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  ojoDerecho: {
    esf: String,
    cvl: String,
    eje: String,
    ado: String,
    rx: String
  },
  ojoIzquierdo: {
    esf: String,
    cvl: String,
    eje: String,
    ado: String,
    rx: String
  },
  observaciones: String,
  comentarios: String,
  fechaConsulta: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Consulta', ConsultaSchema);
