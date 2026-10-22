/* =================================================
   DATOS
================================================= */

let usuarioActual = null;

let cuentas = JSON.parse(
    localStorage.getItem("agendaCuentas") || "[]"
);

let tareas = JSON.parse(
    localStorage.getItem("agendaTareas") || "[]"
);


/* =================================================
   MATERIAS POR CURSO
================================================= */

const materiasPorCurso = {
    "1ro": [
        "Lenguaje",
        "Lengua Extranjera",
        "Ciencias Sociales",
        "Educación Física y Deportes",
        "Educación Musical",
        "Artes Plásticas",
        "Matemáticas",
        "Técnica Tecnología",
        "Biología",
        "Religión"
    ],

    "2do": [
        "Lenguaje",
        "Lengua Extranjera",
        "Ciencias Sociales",
        "Educación Física y Deportes",
        "Educación Musical",
        "Artes Plásticas",
        "Matemáticas",
        "Técnica Tecnología",
        "Biología",
        "Religión"
    ],

    "3ro": [
        "Comunicación y Lenguajes",
        "Lengua Extranjera",
        "Ciencias Sociales",
        "Educación Física y Deportes",
        "Educación Musical",
        "Artes Plásticas",
        "Matemáticas",
        "Técnica Tecnología",
        "Física",
        "Química",
        "Biología",
        "Filosofías y Psicologías",
        "Religión"
    ],

    "4to": [
        "Comunicación y Lenguajes",
        "Lengua Extranjera",
        "Ciencias Sociales",
        "Educación Física y Deportes",
        "Educación Musical",
        "Artes Plásticas",
        "Matemáticas",
        "Técnica Tecnología",
        "Física",
        "Química",
        "Biología",
        "Filosofías y Psicologías",
        "Religión"
    ],

    "5to": [
        "Comunicación y Lenguajes",
        "Lengua Extranjera",
        "Ciencias Sociales",
        "Educación Física y Deportes",
        "Educación Musical",
        "Artes Plásticas",
        "Matemáticas",
        "Técnica Tecnología",
        "Física",
        "Química",
        "Biología",
        "Filosofías y Psicologías",
        "Religión"
    ],

    "6to": [
        "Comunicación y Lenguajes",
        "Lengua Extranjera",
        "Ciencias Sociales",
        "Educación Física y Deportes",
        "Educación Musical",
        "Artes Plásticas",
        "Matemáticas",
        "Técnica Tecnología",
        "Física",
        "Química",
        "Biología",
        "Filosofías y Psicologías",
        "Religión"
    ]
};


/* =================================================
   REGISTRO
================================================= */

document.getElementById("registerForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const nombre =
        document.getElementById("nombre").value.trim();

    const usuario =
        document.getElementById("usuario").value.trim();

    const correo =
        document.getElementById("correo").value.trim();

    const curso =
        document.getElementById("curso").value;

    const paralelo =
        document.getElementById("paralelo").value;

    const opcionTipo =
        document.querySelector('input[name="tipo"]:checked');

    const password =
        document.getElementById("password").value;

    if (!opcionTipo) {
        alert("Selecciona si eres estudiante o administrador.");
        return;
    }

    const tipo = opcionTipo.value;

    if (cuentas.some(c =>
        c.usuario.toLowerCase() === usuario.toLowerCase()
    )) {
        alert("Ese usuario ya existe. Elige otro.");
        return;
    }

    const nuevaCuenta = {
        id: Date.now(),
        nombre,
        usuario,
        correo,
        curso,
        paralelo,
        tipo,
        password
    };

    cuentas.push(nuevaCuenta);

    localStorage.setItem(
        "agendaCuentas",
        JSON.stringify(cuentas)
    );

    usuarioActual = nuevaCuenta;

    alert("¡Cuenta creada correctamente! 🎉");

    mostrarPanel();
});


/* =================================================
   MOSTRAR PANEL
================================================= */

function mostrarPanel() {

    if (!usuarioActual) return;

    document.getElementById("registerScreen")
        .classList.add("hidden");

    document.getElementById("loginScreen")
        .classList.add("hidden");

    document.getElementById("adminScreen")
        .classList.add("hidden");

    document.getElementById("studentScreen")
        .classList.add("hidden");

    cerrarModal();

    if (usuarioActual.tipo === "administrador") {

        document.getElementById("adminScreen")
            .classList.remove("hidden");

        document.getElementById("adminName")
            .textContent = usuarioActual.nombre;

        document.getElementById("adminCourse")
            .textContent =
                usuarioActual.curso + " " +
                usuarioActual.paralelo;

        cargarTareasAdmin();

    } else {

        document.getElementById("studentScreen")
            .classList.remove("hidden");

        document.getElementById("studentName")
            .textContent = usuarioActual.nombre;

        document.getElementById("studentCourse")
            .textContent =
                usuarioActual.curso + " " +
                usuarioActual.paralelo;

        cargarTareasEstudiante();
    }
}


/* =================================================
   ADMIN — ABRIR Y CERRAR MODAL
================================================= */

function abrirModal() {

    if (!usuarioActual ||
        usuarioActual.tipo !== "administrador") {
        return;
    }

    const selector = document.getElementById("taskSubject");

    selector.innerHTML =
        '<option value="">Seleccionar materia</option>';

    const materias =
        materiasPorCurso[usuarioActual.curso] || [];

    materias.forEach(function(materia) {

        const opcion = document.createElement("option");

        opcion.value = materia;
        opcion.textContent = materia;

        selector.appendChild(opcion);
    });

    document.getElementById("taskModal")
        .classList.remove("hidden");
}


function cerrarModal() {

    document.getElementById("taskModal")
        .classList.add("hidden");
}


/* =================================================
   ADMIN — CREAR TAREA
================================================= */

document.getElementById("taskForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    if (!usuarioActual ||
        usuarioActual.tipo !== "administrador") {
        alert("Inicia sesión como administrador para publicar.");
        return;
    }

    const materia =
        document.getElementById("taskSubject").value;

    if (!materia) {
        alert("Selecciona una materia.");
        return;
    }

    const tarea = {
        id: Date.now(),

        titulo:
            document.getElementById("taskTitle").value.trim(),

        descripcion:
            document.getElementById("taskDescription").value.trim(),

        materia,

        tipo:
            document.getElementById("taskType").value,

        fecha:
            document.getElementById("taskDate").value,

        curso: usuarioActual.curso,

        paralelo: usuarioActual.paralelo,

        completada: false
    };

    tareas.push(tarea);

    localStorage.setItem(
        "agendaTareas",
        JSON.stringify(tareas)
    );

    document.getElementById("taskForm").reset();

    cerrarModal();

    cargarTareasAdmin();

    alert("Actividad registrada correctamente. ✅");
});


/* =================================================
   PRIORIDAD
================================================= */

function obtenerPrioridad(fecha, completada) {

    if (completada) {
        return {
            clase: "easy",
            texto: "✓ Completada"
        };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaEntrega = new Date(fecha + "T00:00:00");

    const diferencia = Math.ceil(
        (fechaEntrega - hoy) / (1000 * 60 * 60 * 24)
    );

    if (diferencia <= 1) {
        return {
            clase: "urgent",
            texto: "🔴 Urgente"
        };
    }

    if (diferencia <= 6) {
        return {
            clase: "medium",
            texto: "🟠 Próxima"
        };
    }

    return {
        clase: "easy",
        texto: "🟢 Con tiempo"
    };
}


/* =================================================
   MOSTRAR UNA TAREA
================================================= */

function crearHTMLTarea(tarea, estudiante = false) {

    const prioridad = obtenerPrioridad(
        tarea.fecha,
        tarea.completada
    );

    const fechaBonita = tarea.fecha
        ? new Date(tarea.fecha + "T00:00:00")
            .toLocaleDateString("es-BO", {
                day: "numeric",
                month: "long",
                year: "numeric"
            })
        : "Sin fecha";

    return `
        <div class="task ${prioridad.clase}
            ${tarea.completada ? "completed" : ""}">

            <div class="task-header">
                <div class="task-title">
                    ${escapeHTML(tarea.titulo)}
                </div>

                <div class="task-type">
                    ${escapeHTML(tarea.tipo)}
                </div>
            </div>

            <div class="task-subject">
                📚 ${escapeHTML(tarea.materia || "Sin materia")}
            </div>

            ${
                tarea.descripcion
                    ? `<div class="task-description">
                        ${escapeHTML(tarea.descripcion)}
                       </div>`
                    : ""
            }

            <div class="task-date">
                📅 ${fechaBonita}
            </div>

            <div class="priority ${prioridad.clase}">
                ${prioridad.texto}
            </div>

            ${
                estudiante && !tarea.completada
                    ? `<br>
                       <button class="complete-btn"
                           onclick="completarTarea(${tarea.id})">
                           ✓ Marcar como completada
                       </button>`
                    : ""
            }
        </div>
    `;
}


/* =================================================
   AGRUPAR ACTIVIDADES POR MATERIA
================================================= */

function mostrarTareasPorMateria(
    contenedor,
    lista,
    estudiante
) {

    if (lista.length === 0) {

        contenedor.innerHTML = `
            <div style="text-align:center; padding:30px; opacity:.7">
                📚 Todavía no hay actividades.
            </div>
        `;

        return;
    }

    const grupos = {};

    lista.forEach(function(tarea) {

        const materia = tarea.materia || "Sin materia";

        if (!grupos[materia]) {
            grupos[materia] = [];
        }

        grupos[materia].push(tarea);
    });

    contenedor.innerHTML = Object.keys(grupos)
        .sort((a, b) => a.localeCompare(b, "es"))
        .map(function(materia) {

            const actividades = grupos[materia].sort(
                (a, b) => new Date(a.fecha) - new Date(b.fecha)
            );

            const pendientes = actividades.filter(
                tarea => !tarea.completada
            ).length;

            return `
                <section class="materia-group">

                    <h3 class="materia-heading">
                        <span>📚 ${escapeHTML(materia)}</span>

                        ${
                            pendientes > 0
                                ? `<span class="materia-badge">
                                    ${pendientes}
                                   </span>`
                                : ""
                        }
                    </h3>

                    <div class="task-list">
                        ${actividades.map(tarea =>
                            crearHTMLTarea(tarea, estudiante)
                        ).join("")}
                    </div>

                </section>
            `;
        })
        .join("");
}


/* =================================================
   ADMIN — MOSTRAR SUS TAREAS
================================================= */

function cargarTareasAdmin() {

    if (!usuarioActual) return;

    const contenedor = document.getElementById("adminTasks");

    const misTareas = tareas.filter(t =>
        t.curso === usuarioActual.curso &&
        t.paralelo === usuarioActual.paralelo
    );

    mostrarTareasPorMateria(
        contenedor,
        misTareas,
        false
    );
}


/* =================================================
   ESTUDIANTE — MOSTRAR SUS TAREAS
================================================= */

function cargarTareasEstudiante() {

    if (!usuarioActual) return;

    const contenedor = document.getElementById("studentTasks");

    const misTareas = tareas.filter(t =>
        t.curso === usuarioActual.curso &&
        t.paralelo === usuarioActual.paralelo
    );

    document.getElementById("totalTasks").textContent =
        misTareas.length;

    document.getElementById("pendingTasks").textContent =
        misTareas.filter(t => !t.completada).length;

    document.getElementById("doneTasks").textContent =
        misTareas.filter(t => t.completada).length;

    mostrarTareasPorMateria(
        contenedor,
        misTareas,
        true
    );
}


/* =================================================
   COMPLETAR TAREA
================================================= */

function completarTarea(id) {

    if (!usuarioActual ||
        usuarioActual.tipo !== "estudiante") {
        return;
    }

    const tarea = tareas.find(t => t.id === id);

    if (!tarea) return;

    if (
        tarea.curso !== usuarioActual.curso ||
        tarea.paralelo !== usuarioActual.paralelo
    ) {
        return;
    }

    tarea.completada = true;

    localStorage.setItem(
        "agendaTareas",
        JSON.stringify(tareas)
    );

    cargarTareasEstudiante();
}


/* =================================================
   CAMBIAR ENTRE REGISTRO E INICIO DE SESIÓN
================================================= */

function mostrarLogin() {

    document.getElementById("registerScreen")
        .classList.add("hidden");

    document.getElementById("loginScreen")
        .classList.remove("hidden");
}


function mostrarRegistro() {

    document.getElementById("loginScreen")
        .classList.add("hidden");

    document.getElementById("registerScreen")
        .classList.remove("hidden");
}


/* =================================================
   INICIAR SESIÓN
================================================= */

document.getElementById("loginForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const usuario =
        document.getElementById("loginUsuario").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const cuenta = cuentas.find(c =>
        c.usuario.toLowerCase() === usuario.toLowerCase() &&
        c.password === password
    );

    if (!cuenta) {
        alert("Usuario o contraseña incorrectos. ❌");
        return;
    }

    usuarioActual = cuenta;

    mostrarPanel();
});


/* =================================================
   CERRAR SESIÓN
================================================= */

function cerrarSesion() {

    usuarioActual = null;

    cerrarModal();

    document.getElementById("adminScreen")
        .classList.add("hidden");

    document.getElementById("studentScreen")
        .classList.add("hidden");

    document.getElementById("loginScreen")
        .classList.add("hidden");

    document.getElementById("registerScreen")
        .classList.remove("hidden");
}


/* =================================================
   PROTEGER TEXTO MOSTRADO
================================================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
       }
