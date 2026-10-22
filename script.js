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
   REGISTRO
================================================= */

document
.getElementById("registerForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const nombre =
        document
        .getElementById("nombre")
        .value
        .trim();

    const usuario =
        document
        .getElementById("usuario")
        .value
        .trim();

    const correo =
        document
        .getElementById("correo")
        .value
        .trim();

    const curso =
        document
        .getElementById("curso")
        .value;

    const paralelo =
        document
        .getElementById("paralelo")
        .value;

    const tipo =
        document
        .querySelector(
            'input[name="tipo"]:checked'
        )
        .value;

    const password =
        document
        .getElementById("password")
        .value;


    /* Verificar usuario */

    if (
        cuentas.some(
            c => c.usuario === usuario
        )
    ) {

        alert(
            "Ese usuario ya existe. Elige otro."
        );

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


    alert(
        "¡Cuenta creada correctamente! 🎉"
    );


    mostrarPanel();

});


/* =================================================
   MOSTRAR PANEL
================================================= */

function mostrarPanel() {

    /*
       CORRECCIÓN:
       Se ocultan completamente tanto
       REGISTRO como INICIO DE SESIÓN.
    */

    document
    .getElementById("registerScreen")
    .classList.add("hidden");

    document
    .getElementById("loginScreen")
    .classList.add("hidden");


    if (
        usuarioActual.tipo === "administrador"
    ) {

        document
        .getElementById("adminScreen")
        .classList.remove("hidden");


        document
        .getElementById("adminName")
        .textContent =
            usuarioActual.nombre;


        document
        .getElementById("adminCourse")
        .textContent =
            usuarioActual.curso +
            " " +
            usuarioActual.paralelo;


        cargarTareasAdmin();

    }

    else {

        document
        .getElementById("studentScreen")
        .classList.remove("hidden");


        document
        .getElementById("studentName")
        .textContent =
            usuarioActual.nombre;


        document
        .getElementById("studentCourse")
        .textContent =
            usuarioActual.curso +
            " " +
            usuarioActual.paralelo;


        cargarTareasEstudiante();

    }

}


/* =================================================
   ADMIN — ABRIR MODAL
================================================= */

function abrirModal() {

    document
    .getElementById("taskModal")
    .classList
    .remove("hidden");

}


function cerrarModal() {

    document
    .getElementById("taskModal")
    .classList
    .add("hidden");

}


/* =================================================
   ADMIN — CREAR TAREA
================================================= */

document
.getElementById("taskForm")
.addEventListener("submit", function(e) {

    e.preventDefault();


    const tarea = {

        id: Date.now(),

        titulo:
            document
            .getElementById("taskTitle")
            .value,

        descripcion:
            document
            .getElementById("taskDescription")
            .value,

        tipo:
            document
            .getElementById("taskType")
            .value,

        fecha:
            document
            .getElementById("taskDate")
            .value,

        curso:
            usuarioActual.curso,

        paralelo:
            usuarioActual.paralelo,

        completada: false

    };


    tareas.push(tarea);


    localStorage.setItem(
        "agendaTareas",
        JSON.stringify(tareas)
    );


    document
    .getElementById("taskForm")
    .reset();


    cerrarModal();


    cargarTareasAdmin();

   


    alert(
        "Actividad registrada correctamente. ✅"
    );

});


/* =================================================
   PRIORIDAD
================================================= */

function obtenerPrioridad(
    fecha,
    completada
) {

    if (completada) {

        return {

            clase: "easy",

            texto: "✓ Completada"

        };

    }


    const hoy = new Date();

    hoy.setHours(0,0,0,0);


    const fechaEntrega =
        new Date(
            fecha + "T00:00:00"
        );


    const diferencia =
        Math.ceil(
            (fechaEntrega - hoy) /
            (1000 * 60 * 60 * 24)
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
   MOSTRAR TAREA
================================================= */

function crearHTMLTarea(
    tarea,
    estudiante = false
) {

    const prioridad =
        obtenerPrioridad(
            tarea.fecha,
            tarea.completada
        );


    const fechaBonita =
        new Date(
            tarea.fecha +
            "T00:00:00"
        )
        .toLocaleDateString(
            "es-BO",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    return `

    <div class="task
        ${prioridad.clase}
        ${tarea.completada
            ? 'completed'
            : ''
        }">

        <div class="task-header">

            <div class="task-title">
                ${escapeHTML(
                    tarea.titulo
                )}
            </div>

            <div class="task-type">
                ${escapeHTML(
                    tarea.tipo
                )}
            </div>

        </div>


        ${
            tarea.descripcion
            ?
            `<div class="task-description">
                ${escapeHTML(
                    tarea.descripcion
                )}
            </div>`
            :
            ""
        }


        <div class="task-date">
            📅 ${fechaBonita}
        </div>


        <div class="priority
            ${prioridad.clase}">
            ${prioridad.texto}
        </div>


        ${
            estudiante &&
            !tarea.completada
            ?
            `<br>

            <button
                class="complete-btn"
                onclick="completarTarea(
                    ${tarea.id}
                )"
            >
                ✓ Marcar como completada
            </button>`

            :
            ""
        }

    </div>

    `;

}


/* =================================================
   ADMIN — MOSTRAR SUS TAREAS
================================================= */

function cargarTareasAdmin() {

    const contenedor =
        document
        .getElementById("adminTasks");


    const misTareas =
        tareas.filter(
            t =>
                t.curso ===
                    usuarioActual.curso
                &&
                t.paralelo ===
                    usuarioActual.paralelo
        );


    if (
        misTareas.length === 0
    ) {

        contenedor.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:30px;
                    opacity:.7
                "
            >
                📚 Todavía no hay actividades.
                <br>
                Agrega la primera.
            </div>

        `;

        return;
    }


    contenedor.innerHTML =

        misTareas

        .sort(
            (a,b) =>
                new Date(a.fecha) -
                new Date(b.fecha)
        )

        .map(
            t =>
                crearHTMLTarea(t)
        )

        .join("");

}


/* =================================================
   ESTUDIANTE — MOSTRAR TAREAS
================================================= */

function cargarTareasEstudiante() {

    const contenedor =
        document
        .getElementById("studentTasks");


    const misTareas =
        tareas.filter(
            t =>
                t.curso ===
                    usuarioActual.curso
                &&
                t.paralelo ===
                    usuarioActual.paralelo
        );


    document
    .getElementById("totalTasks")
    .textContent =
        misTareas.length;


    document
    .getElementById("pendingTasks")
    .textContent =
        misTareas.filter(
            t => !t.completada
        ).length;


    document
    .getElementById("doneTasks")
    .textContent =
        misTareas.filter(
            t => t.completada
        ).length;


    if (
        misTareas.length === 0
    ) {

        contenedor.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:30px;
                    opacity:.7
                "
            >
                🌟 No tienes actividades
                por ahora.
            </div>

        `;

        return;
    }


    contenedor.innerHTML =

        misTareas

        .sort(
            (a,b) =>
                new Date(a.fecha) -
                new Date(b.fecha)
        )

        .map(
            t =>
                crearHTMLTarea(
                    t,
                    true
                )
        )

        .join("");

}


/* =================================================
   COMPLETAR TAREA
================================================= */

function completarTarea(id) {

    const tarea =
        tareas.find(
            t => t.id === id
        );


    if (!tarea) return;


    tarea.completada = true;


    localStorage.setItem(
        "agendaTareas",
        JSON.stringify(tareas)
    );


    cargarTareasEstudiante();

}


/* =================================================
   INICIAR SESIÓN
================================================= */

function mostrarLogin() {

    document
    .getElementById("registerScreen")
    .classList
    .add("hidden");


    document
    .getElementById("loginScreen")
    .classList
    .remove("hidden");

}


function mostrarRegistro() {

    document
    .getElementById("loginScreen")
    .classList
    .add("hidden");


    document
    .getElementById("registerScreen")
    .classList
    .remove("hidden");

}


document
.getElementById("loginForm")
.addEventListener(
    "submit",
    function(e) {

        e.preventDefault();


        const usuario =
            document
            .getElementById(
                "loginUsuario"
            )
            .value
            .trim();


        const password =
            document
            .getElementById(
                "loginPassword"
            )
            .value;


        const cuenta =
            cuentas.find(
                c =>
                    c.usuario
                    .toLowerCase()
                    ===
                    usuario.toLowerCase()
                    &&
                    c.password
                    ===
                    password
            );


        if (!cuenta) {

            alert(
                "Usuario o contraseña incorrectos. ❌"
            );

            return;
        }


        usuarioActual = cuenta;


        /*
           AQUÍ SE LLAMA A mostrarPanel()
           Y mostrarPanel() ahora oculta
           TAMBIÉN loginScreen.
        */

        mostrarPanel();

    }
);


/* =================================================
   CERRAR SESIÓN
================================================= */

function cerrarSesion() {

    usuarioActual = null;


    document
    .getElementById("adminScreen")
    .classList
    .add("hidden");


    document
    .getElementById("studentScreen")
    .classList
    .add("hidden");


    /*
       También ocultamos login por si
       estaba visible.
    */

    document
    .getElementById("loginScreen")
    .classList
    .add("hidden");


    document
    .getElementById("registerScreen")
    .classList
    .remove("hidden");

}


/* =================================================
   SEGURIDAD BÁSICA PARA TEXTO
================================================= */

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
