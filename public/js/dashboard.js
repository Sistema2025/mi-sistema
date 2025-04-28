// public/js/dashboard.js

let editandoPaciente = null;
let consultasGuardadas = [];
let pacienteActual = null;


// Botones del menú
document.getElementById('pacientes').addEventListener('click', () => {
  mostrarSeccionPacientes();
});

document.getElementById('ventas').addEventListener('click', () => {
  document.getElementById('contenido').innerHTML = `
    <h1>Ventas</h1>
    <p>Sección de ventas aquí.</p>
  `;
});

document.getElementById('historia').addEventListener('click', () => {
  mostrarHistoriaClinica();
});

document.getElementById('inventario').addEventListener('click', () => {
  document.getElementById('contenido').innerHTML = `
    <h1>Inventario</h1>
    <p>Gestión de inventario de medicamentos.</p>
  `;
});

document.getElementById('consultas').addEventListener('click', () => {
  document.getElementById('contenido').innerHTML = `
    <h1>Consultas Médicas</h1>
    <p>Registrar nuevas consultas aquí.</p>
  `;
});

document.getElementById('cerrarSesion').addEventListener('click', () => {
  const confirmar = confirm("¿Desea cerrar sesión?");
  if (confirmar) {
    window.location.href = '/login.html';
  }
});

// Mostrar sección de pacientes
function mostrarSeccionPacientes() {
  document.getElementById('contenido').innerHTML = `
    <div class="pacientes-header">
      <h1>Pacientes</h1>
      <button id="btnNuevoPaciente">Nuevo Paciente</button>
    </div>

    <div style="margin: 20px 0;">
      <input type="text" id="buscarPaciente" placeholder="Buscar por nombre o cédula" style="width: 100%; padding: 10px; border: 1px solid #00bfff; border-radius: 5px;">
    </div>

    <h2>Listado de Pacientes</h2>
    <table class="tabla-pacientes">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Cédula</th>
          <th>Teléfono</th>
          <th>Fecha Nacimiento (Edad)</th>
          <th>Sexo</th>
          <th>Dirección</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="listaPacientes">
        <!-- Pacientes se insertan aquí -->
      </tbody>
    </table>
  `;

  document.getElementById('btnNuevoPaciente').addEventListener('click', () => mostrarFormularioPaciente());
  document.getElementById('buscarPaciente').addEventListener('input', (e) => {
    mostrarPacientes(e.target.value);
  });

  mostrarPacientes();
}

// Mostrar pacientes
async function mostrarPacientes(filtro = '') {
  const listaPacientes = document.getElementById('listaPacientes');
  listaPacientes.innerHTML = '';

  try {
    const res = await fetch('/api/pacientes');
    const pacientes = await res.json();

    pacientes
      .filter(paciente =>
        paciente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        paciente.cedula.includes(filtro)
      )
      .forEach((paciente) => {
        const fila = document.createElement('tr');
        const edad = calcularEdad(paciente.fechaNacimiento);

        fila.innerHTML = `
          <td>${paciente.nombre}</td>
          <td>${paciente.cedula}</td>
          <td>${paciente.telefono}</td>
          <td>${paciente.fechaNacimiento} (${edad} años)</td>
          <td>${paciente.sexo}</td>
          <td>${paciente.direccion}</td>
          <td>
            <button class="editar" onclick="editarPaciente('${paciente._id}')"><i class="fas fa-edit"></i></button>
            <button class="eliminar" onclick="eliminarPaciente('${paciente._id}')"><i class="fas fa-trash"></i></button>
          </td>
        `;
        listaPacientes.appendChild(fila);
      });
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
  }
}

// Calcular edad
function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

// Mostrar formulario nuevo/editar paciente
function mostrarFormularioPaciente(paciente = null) {
  editandoPaciente = paciente ? paciente._id : null;

  document.getElementById('contenido').innerHTML = `
    <h1>${paciente ? 'Editar Paciente' : 'Nuevo Paciente'}</h1>
    <form id="formularioPaciente" class="formulario">
      <label>Nombre:</label>
      <input type="text" id="nombre" required value="${paciente ? paciente.nombre : ''}">
      
      <label>Cédula:</label>
      <input type="text" id="cedula" required value="${paciente ? paciente.cedula : ''}">
      
      <label>Teléfono:</label>
      <input type="text" id="telefono" required value="${paciente ? paciente.telefono : ''}">
      
      <label>Fecha de Nacimiento:</label>
      <input type="date" id="fechaNacimiento" required value="${paciente ? paciente.fechaNacimiento.split('T')[0] : ''}">
      
      <label>Sexo:</label>
      <select id="sexo" required>
        <option value="">Seleccione una opción</option>
        <option value="Masculino" ${paciente?.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
        <option value="Femenino" ${paciente?.sexo === 'Femenino' ? 'selected' : ''}>Femenino</option>
        <option value="Otro" ${paciente?.sexo === 'Otro' ? 'selected' : ''}>Otro</option>
      </select>

      <label>Dirección:</label>
      <input type="text" id="direccion" required value="${paciente ? paciente.direccion : ''}">

      <button type="submit">${paciente ? 'Actualizar' : 'Guardar'}</button>
      <button type="button" id="cancelar">Cancelar</button>
    </form>
  `;

  document.getElementById('formularioPaciente').addEventListener('submit', guardarPaciente);
  document.getElementById('cancelar').addEventListener('click', () => {
    editandoPaciente = null;
    mostrarSeccionPacientes();
  });
}

// Guardar o actualizar paciente
async function guardarPaciente(event) {
  event.preventDefault();

  const pacienteData = {
    nombre: document.getElementById('nombre').value,
    cedula: document.getElementById('cedula').value,
    telefono: document.getElementById('telefono').value,
    fechaNacimiento: document.getElementById('fechaNacimiento').value,
    sexo: document.getElementById('sexo').value,
    direccion: document.getElementById('direccion').value,
  };

  try {
    if (editandoPaciente) {
      await fetch(`/api/pacientes/${editandoPaciente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pacienteData),
      });
      mostrarNotificacion('Paciente actualizado correctamente ✏️', 'success');
    } else {
      await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pacienteData),
      });
      mostrarNotificacion('Paciente registrado correctamente ✅', 'success');
    }

    editandoPaciente = null;

    setTimeout(() => {
      mostrarSeccionPacientes();
    }, 1000);

  } catch (error) {
    console.error('Error al guardar paciente:', error);
    mostrarNotificacion('Error al guardar paciente', 'error');
  }
}

// Editar paciente (buscar uno solo)
async function editarPaciente(id) {
  try {
    const res = await fetch(`/api/pacientes/${id}`);
    const paciente = await res.json();
    mostrarFormularioPaciente(paciente);
  } catch (error) {
    console.error('Error al cargar paciente:', error);
  }
}

// Eliminar paciente
async function eliminarPaciente(id) {
  if (confirm('¿Seguro que quieres eliminar este paciente?')) {
    try {
      await fetch(`/api/pacientes/${id}`, {
        method: 'DELETE',
      });
      mostrarNotificacion('Paciente eliminado correctamente 🗑️', 'success');
      await mostrarPacientes();
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      mostrarNotificacion('Error al eliminar paciente', 'error');
    }
  }
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
  const notificacion = document.createElement('div');
  notificacion.textContent = mensaje;
  notificacion.className = `notificacion ${tipo}`;
  document.body.appendChild(notificacion);

  setTimeout(() => {
    notificacion.remove();
  }, 2000);
}

// ---------------- HISTORIA CLÍNICA ---------------- //

async function mostrarHistoriaClinica() {
  document.getElementById('contenido').innerHTML = `
    <h1>Historia Clínica</h1>

    <div style="margin: 20px 0;">
      <input type="text" id="buscarPacienteHistoria" placeholder="Buscar paciente por nombre o cédula" style="width: 100%; padding: 10px; border: 1px solid #00bfff; border-radius: 5px;">
    </div>

    <div id="seccionHistoria">
      <!-- Formulario y consultas anteriores -->
    </div>
  `;

  document.getElementById('buscarPacienteHistoria').addEventListener('input', (e) => {
    buscarPacienteHistoria(e.target.value);
  });
}

async function buscarPacienteHistoria(filtro = '') {
  const seccionHistoria = document.getElementById('seccionHistoria');
  seccionHistoria.innerHTML = '';

  try {
    const res = await fetch('/api/pacientes');
    const pacientes = await res.json();

    const filtrados = pacientes.filter(p =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.cedula.includes(filtro)
    );

    if (filtrados.length === 0) {
      seccionHistoria.innerHTML = '<p>No se encontraron pacientes.</p>';
      return;
    }

    seccionHistoria.innerHTML = '<h2>Seleccione un paciente:</h2>';
    filtrados.forEach(paciente => {
      const btn = document.createElement('button');
      btn.textContent = `${paciente.nombre} - ${paciente.cedula}`;
      btn.style.display = 'block';
      btn.style.margin = '10px 0';
      btn.style.padding = '10px';
      btn.style.width = '100%';
      btn.style.border = '1px solid #00bfff';
      btn.style.borderRadius = '5px';
      btn.style.backgroundColor = '#f0f8ff';
      btn.addEventListener('click', () => {
        cargarFormularioConsulta(paciente);
      });
      seccionHistoria.appendChild(btn);
    });

  } catch (error) {
    console.error('Error al buscar pacientes:', error);
  }
}

function cargarFormularioConsulta(paciente) {
  document.getElementById('seccionHistoria').innerHTML = `
    <h2>Paciente: ${paciente.nombre}</h2>

    <form id="formularioConsulta" class="formulario">
      <h3>Ojo Derecho</h3>
      <div class="campo">
        <label for="odEsf">ESF:</label>
        <input type="text" id="odEsf" placeholder="ESF" required>
      </div>
      <div class="campo">
        <label for="odCvl">CVL:</label>
        <input type="text" id="odCvl" placeholder="CVL" required>
      </div>
      <div class="campo">
        <label for="odEje">EJE:</label>
        <input type="text" id="odEje" placeholder="EJE" required>
      </div>
      <div class="campo">
        <label for="odAdo">ADO:</label>
        <input type="text" id="odAdo" placeholder="ADO" required>
      </div>
      <div class="campo">
        <label for="odRx">RX:</label>
        <input type="text" id="odRx" placeholder="RX" required>
      </div>

      <h3>Ojo Izquierdo</h3>
      <div class="campo">
        <label for="oiEsf">ESF:</label>
        <input type="text" id="oiEsf" placeholder="ESF" required>
      </div>
      <div class="campo">
        <label for="oiCvl">CVL:</label>
        <input type="text" id="oiCvl" placeholder="CVL" required>
      </div>
      <div class="campo">
        <label for="oiEje">EJE:</label>
        <input type="text" id="oiEje" placeholder="EJE" required>
      </div>
      <div class="campo">
        <label for="oiAdo">ADO:</label>
        <input type="text" id="oiAdo" placeholder="ADO" required>
      </div>
      <div class="campo">
        <label for="oiRx">RX:</label>
        <input type="text" id="oiRx" placeholder="RX" required>
      </div>

      <h3>Observaciones</h3>
      <div class="campo">
        <label for="observaciones">Observaciones:</label>
        <textarea id="observaciones" placeholder="Observaciones"></textarea>
      </div>

      <h3>Comentarios</h3>
      <div class="campo">
        <label for="comentarios">Comentarios:</label>
        <textarea id="comentarios" placeholder="Comentarios"></textarea>
      </div>

      <button type="submit" class="boton">Guardar Consulta</button>
    </form>

    <h2>Consultas Anteriores</h2>
    <div id="consultasAnteriores"></div>
  `;

  document.getElementById('formularioConsulta').addEventListener('submit', (e) => {
    e.preventDefault();
    guardarConsulta(paciente._id);
    document.getElementById('formularioConsulta').reset(); // <--- ESTA LÍNEA LIMPIA TODO
  });
  
  cargarConsultasAnteriores(paciente._id);
}

async function guardarConsulta(pacienteId) {
  const consulta = {
    pacienteId,
    ojoDerecho: {
      esf: document.getElementById('odEsf').value,
      cvl: document.getElementById('odCvl').value,
      eje: document.getElementById('odEje').value,
      ado: document.getElementById('odAdo').value,
      rx: document.getElementById('odRx').value,
    },
    ojoIzquierdo: {
      esf: document.getElementById('oiEsf').value,
      cvl: document.getElementById('oiCvl').value,
      eje: document.getElementById('oiEje').value,
      ado: document.getElementById('oiAdo').value,
      rx: document.getElementById('oiRx').value,
    },
    observaciones: document.getElementById('observaciones').value,
    comentarios: document.getElementById('comentarios').value,
    fechaConsulta: new Date().toISOString()
  };

  try {
    await fetch('/api/consultas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consulta),
    });

    mostrarNotificacion('Consulta guardada correctamente ✅', 'success');
    setTimeout(() => cargarConsultasAnteriores(pacienteId), 500);

  } catch (error) {
    console.error('Error al guardar consulta:', error);
    mostrarNotificacion('Error al guardar consulta', 'error');
  }
}

async function cargarConsultasAnteriores(pacienteId) {
  const contenedor = document.getElementById('consultasAnteriores');
  contenedor.innerHTML = '';

  try {
    const resPaciente = await fetch(`/api/pacientes/${pacienteId}`);
    pacienteActual = await resPaciente.json(); // Ahora tenemos el paciente real

    const resConsultas = await fetch(`/api/consultas?pacienteId=${pacienteId}`);
    consultasGuardadas = await resConsultas.json();

    if (consultasGuardadas.length === 0) {
      contenedor.innerHTML = '<p>No hay consultas anteriores.</p>';
      return;
    }

    consultasGuardadas.forEach((consulta, index) => {
      const div = document.createElement('div');
      div.className = 'consulta-anterior';
      div.innerHTML = `
        <div class="tarjeta-consulta">
          <h4 class="fecha-consulta">Fecha: ${new Date(consulta.fechaConsulta).toLocaleDateString()}</h4>
          <p><strong>Ojo Derecho:</strong> ESF: ${consulta.ojoDerecho.esf}, CVL: ${consulta.ojoDerecho.cvl}, EJE: ${consulta.ojoDerecho.eje}, ADO: ${consulta.ojoDerecho.ado}, RX: ${consulta.ojoDerecho.rx}</p>
          <p><strong>Ojo Izquierdo:</strong> ESF: ${consulta.ojoIzquierdo.esf}, CVL: ${consulta.ojoIzquierdo.cvl}, EJE: ${consulta.ojoIzquierdo.eje}, ADO: ${consulta.ojoIzquierdo.ado}, RX: ${consulta.ojoIzquierdo.rx}</p>
          <p><strong>Observaciones:</strong> ${consulta.observaciones}</p>
          <p><strong>Comentarios:</strong> ${consulta.comentarios}</p>
          <button class="boton-imprimir" onclick="imprimirConsulta(${index})">
            🖨️ Imprimir Consulta
          </button>
        </div>
      `;
      contenedor.appendChild(div);
    });
    

  } catch (error) {
    console.error('Error al cargar consultas anteriores:', error);
  }
}

//DATOS PARA GENERAR PDF
async function imprimirConsulta(index) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const consulta = consultasGuardadas[index];

  // Información de la óptica (sin logo)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre Óptica ', 105, 20, null, null, 'center');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Dirección: Calle Optica', 105, 28, null, null, 'center');
  doc.text('Teléfono: Optica', 105, 34, null, null, 'center');

  doc.setLineWidth(0.5);
  doc.line(10, 40, 200, 40);

  // Datos del Paciente
  doc.setFontSize(14);
  doc.text('Datos del Paciente:', 10, 50);
  doc.setFontSize(12);
  doc.text(`Nombre: ${pacienteActual.nombre}`, 10, 58);
  doc.text(`Cédula: ${pacienteActual.cedula}`, 10, 64);
  doc.text(`Teléfono: ${pacienteActual.telefono}`, 10, 70);
  doc.text(`Fecha de Nacimiento: ${new Date(pacienteActual.fechaNacimiento).toLocaleDateString()}`, 10, 76);
  doc.text(`Sexo: ${pacienteActual.sexo}`, 10, 82);

  doc.line(10, 90, 200, 90);

  // Datos de la Consulta
  doc.setFontSize(14);
  doc.text('Consulta Visual:', 10, 100);
  doc.setFontSize(12);
  doc.text(`Fecha de Consulta: ${new Date(consulta.fechaConsulta).toLocaleDateString()}`, 10, 108);

  // Datos de los ojos
  doc.setFontSize(13);
  doc.text('Ojo Derecho', 30, 120);
  doc.text('Ojo Izquierdo', 140, 120);

  doc.setFontSize(12);
  doc.text(`ESF: ${consulta.ojoDerecho.esf}`, 20, 130);
  doc.text(`CVL: ${consulta.ojoDerecho.cvl}`, 20, 136);
  doc.text(`EJE: ${consulta.ojoDerecho.eje}`, 20, 142);
  doc.text(`ADO: ${consulta.ojoDerecho.ado}`, 20, 148);
  doc.text(`RX: ${consulta.ojoDerecho.rx}`, 20, 154);

  doc.text(`ESF: ${consulta.ojoIzquierdo.esf}`, 130, 130);
  doc.text(`CVL: ${consulta.ojoIzquierdo.cvl}`, 130, 136);
  doc.text(`EJE: ${consulta.ojoIzquierdo.eje}`, 130, 142);
  doc.text(`ADO: ${consulta.ojoIzquierdo.ado}`, 130, 148);
  doc.text(`RX: ${consulta.ojoIzquierdo.rx}`, 130, 154);

  doc.line(10, 160, 200, 160);

  // Observaciones y Comentarios
  doc.setFontSize(14);
  doc.text('Observaciones:', 10, 170);
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(consulta.observaciones || 'N/A', 180), 10, 178);

  doc.setFontSize(14);
  doc.text('Comentarios:', 10, 200);
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(consulta.comentarios || 'N/A', 180), 10, 208);

  // Espacio para la firma
  const firmaX = 60;
  const firmaY = 250;
  const firmaWidth = 90;
  const firmaHeight = 25;

  doc.setDrawColor(50); // Un gris elegante
  doc.setLineWidth(0.3);
  doc.rect(firmaX, firmaY, firmaWidth, firmaHeight, 'S'); // Caja de firma

  doc.setFontSize(10);
  doc.text('', 105, firmaY + 15, null, null, 'center');

  doc.setFontSize(12);
  doc.text('Firma del Profesional', 105, firmaY + 40, null, null, 'center');


  // Descargar el PDF
  doc.save(`consulta_${pacienteActual.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

