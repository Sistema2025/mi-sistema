// routes/consultas.js

const express = require('express');
const router = express.Router();
const Consulta = require('../models/Consulta');

// Crear nueva consulta
router.post('/', async (req, res) => {
  try {
    const nuevaConsulta = new Consulta(req.body);
    await nuevaConsulta.save();
    res.status(201).json(nuevaConsulta);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la consulta', error });
  }
});

// Obtener consultas por paciente
router.get('/', async (req, res) => {
  try {
    const { pacienteId } = req.query;

    if (!pacienteId) {
      return res.status(400).json({ message: 'Falta el pacienteId en la consulta' });
    }

    const consultas = await Consulta.find({ pacienteId }).sort({ fechaConsulta: -1 });
    res.json(consultas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las consultas', error });
  }
});

module.exports = router;
