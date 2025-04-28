// models/Consulta.js
import mongoose from 'mongoose';

const ConsultaSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
  fechaConsulta: { type: Date, required: true },
  mensajeEnviado: { type: Boolean, default: false }, // Para saber si ya mandaste el recordatorio
});

export default mongoose.models.Consulta || mongoose.model('Consulta', ConsultaSchema);
