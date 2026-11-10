/* =================================================
   AGENDA ESTUDIANTIL - FIREBASE
   Inicio de sesión con nombre de usuario y contraseña.
   No solicita correos personales.
================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    addDoc,
    collection,
    query,
    where,
    onSnapshot,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

/* =================================================
   CONFIGURACIÓN FIREBASE
================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyAG9aC6t-4zFtSfIuFx24RXK-GcKp9Z6KY",
    authDomain: "agenda-estudiantil-3e385.firebaseapp.com",
    projectId: "agenda-estudiantil-3e385",
    storageBucket: "agenda-estudiantil-3e385.firebasestorage.app",
    messagingSenderId: "747404004067",
    appId: "1:747404004067:web:c3d226cddf3c01d31293d6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/*
  Firebase Authentication exige un correo para el método
  correo/contraseña. Generamos uno técnico por usuario.
  No es un correo personal ni recibe mensajes.
*/
const DOMINIO_INTERNO = "usuarios.agendaestudiantil.com";

function usuarioAEmail(usuario) {
    return `${usuario.trim().toLowerCase()}@${DOMINIO_INTERNO}`;
}

function normalizarUsuario(usuario) {
    return usuario.trim().toLowerCase();
}

/* =================================================
   ESTADO
================================================= */

let usuarioActual = null;
let detenerEscuchaTareas = null;
let procesandoRegistro = false;

/* =================================================
   MATERIAS POR CURSO
================================================= */

const materiasPorCurso = {
    "1ro": [
        "Lenguaje", "Lengua Extranjera", "Ciencias Sociales",
        "Educación Física y Deportes", "Educación Musical",
        "Artes Plásticas", "Matemáticas", "Técnica Tecnología",
        "Biología", "Religión"
    ],
    "2do": [
        "Lenguaje", "Lengua Extranjera", "Ciencias Sociales",
        "Educación Física y Deportes", "Educación Musical",
        "Artes Plásticas", "Matemáticas", "Técnica Tecnología",
        "Biología", "Religión"
    ],
    "3ro": [
        "Comunicación y Lenguajes", "Lengua Extranjera",
        "Ciencias Sociales", "Educación Física y Deportes",
        "Educación Musical", "Artes Plásticas", "Matemáticas",
        "Técnica Tecnología", "Física", "Química", "Biología",
        "Filosofías y Psicologías", "Religión"
    ],
    "4to": [
        "Comunicación y Lenguajes", "Lengua Extranjera",
        "Ciencias Sociales", "Educación Física y Deportes",
        "Educación Musical", "Artes Plásticas", "Matemáticas",
        "Técnica Tecnología", "Física", "Química", "Biología",
        "Filosofías y Psicologías", "Religión"
    ],
    "5to": [
        "Comunicación y Lenguajes", "Lengua Extranjera",
        "Ciencias Sociales", "Educación Física y Deportes",
        "Educación Musical", "Artes Plásticas", "Matemáticas",
        "Técnica Tecnología", "Física", "Química", "Biología",
        "Filosofías y Psicologías", "Religión"
    ],
    "6to": [
        "Comunicación y Lenguajes", "Lengua Extranjera",
        "Ciencias Sociales", "Educación Física y Deportes",
        "Educación Musical", "Artes Plásticas", "Matemáticas",
        "Técnica Tecnología", "Física", "Química", "Biología",
        "Filosofías y Psicologías", "Religión"
    ]
};

/* =================================================
   MENSAJES DE ERROR
================================================= */

function mensajeError(error) {
    const codigo = error?.code || "";

    const mensajes = {
        "auth/email-already-in-use": "Ese nombre de usuario ya está registrado. Elige otro.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/invalid-email": "El nombre de usuario no es válido.",
        "auth/invalid-credential": "Usuario o contraseña incorrectos.",
        "auth/user-not-found": "Usuario o contraseña incorrectos.",
        "auth/wrong-password": "Usuario o contraseña incorrectos.",
        "auth/network-request-failed": "No se pudo conectar. Revisa tu conexión a internet.",
        "permission-denied": "Firebase no permitió esta operación. Revisa las reglas de Firestore.",
        "unavailable": "El servicio no está disponible. Intenta nuevamente."
    };

    return mensajes[codigo] || error?.message || "Ocurrió un error. Intenta nuevamente.";
}

/* =================================================
   REGISTRO
================================================= */

document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    if (procesandoRegistro) return;

    const nombre = document.getElementById("nombre").value.trim();
    const usuario = normalizarUsuario(document.getElementById("usuario").value);
    const curso = document.getElementById("curso").value;
    const paralelo = document.getElementById("paralelo").value;
    const opcionTipo = document.querySelector('input[name="tipo"]:checked');
    const password = document.getElementById("password").value;

    if (!opcionTipo) {
        alert("Selecciona si eres estudiante o administrador.");
        return;
    }

    if (!/^[a-z0-9._-]{3,20}$/.test(usuario)) {
        alert("El usuario debe tener entre 3 y 20 caracteres y solo puede incluir letras sin tilde, números, punto, guion o guion bajo.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    // Los nuevos registros siempre empiezan como estudiante.
    // El responsable del proyecto podrá promover administradores manualmente.
    const solicitabaAdmin = opcionTipo.value === "administrador";
    const emailInterno = usuarioAEmail(usuario);
    const refUsuario = doc(db, "usernameIndex", usuario);

    procesandoRegistro = true;

    try {
        const existente = await getDoc(refUsuario);
        if (existente.exists()) {
            alert("Ese nombre de usuario ya existe. Elige otro.");
            return;
        }

        const credencial = await createUserWithEmailAndPassword(auth, emailInterno, password);
        const uid = credencial.user.uid;

        try {
            await runTransaction(db, async (transaction) => {
                const registroUsuario = await transaction.get(refUsuario);

                if (registroUsuario.exists()) {
                    throw new Error("USERNAME_TAKEN");
                }

                transaction.set(refUsuario, {
                    uid,
                    username: usuario
                });

                transaction.set(doc(db, "users", uid), {
                    uid,
                    nombre,
                    usuario,
                    curso,
                    paralelo,
                    role: "estudiante",
                    createdAt: serverTimestamp()
                });
            });
        } catch (errorTransaccion) {
            await deleteUser(credencial.user).catch(() => {});
            throw errorTransaccion;
        }

        usuarioActual = {
            uid,
            nombre,
            usuario,
            curso,
            paralelo,
            role: "estudiante"
        };

        document.getElementById("registerForm").reset();

        if (solicitabaAdmin) {
            alert("Tu cuenta se creó como estudiante. Para activar permisos de administrador, el responsable de Agenda Estudiantil debe autorizar tu cuenta.");
        } else {
            alert("¡Cuenta creada correctamente! 🎉");
        }

        mostrarPanel();

    } catch (error) {
        if (error.message === "USERNAME_TAKEN") {
            alert("Ese nombre de usuario acaba de ser registrado. Elige otro.");
        } else {
            alert(mensajeError(error));
        }
    } finally {
        procesandoRegistro = false;
    }
});

/* =================================================
   INICIO Y RESTAURACIÓN DE SESIÓN
================================================= */

document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const usuario = normalizarUsuario(document.getElementById("loginUsuario").value);
    const password = document.getElementById("loginPassword").value;

    if (!/^[a-z0-9._-]{3,20}$/.test(usuario)) {
        alert("Escribe un nombre de usuario válido.");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, usuarioAEmail(usuario), password);
        document.getElementById("loginForm").reset();
    } catch (error) {
        alert(mensajeError(error));
    }
});

onAuthStateChanged(auth, async (firebaseUser) => {
    // Durante el registro, el perfil de Firestore todavía puede estar creándose.
    // El registro muestra el panel manualmente cuando termina la transacción.
    if (procesandoRegistro) return;

    if (!firebaseUser) {
        usuarioActual = null;
        detenerEscucha();
        ocultarPaneles();
        document.getElementById("registerScreen").classList.remove("hidden");
        return;
    }

    try {
        const perfil = await getDoc(doc(db, "users", firebaseUser.uid));

        if (!perfil.exists()) {
            await signOut(auth);
            alert("No se encontró el perfil de esta cuenta. Contacta al responsable de la aplicación.");
            return;
        }

        usuarioActual = { ...perfil.data(), uid: firebaseUser.uid };
        mostrarPanel();
    } catch (error) {
        alert(mensajeError(error));
    }
});

/* =================================================
   MOSTRAR PANELES
================================================= */

function ocultarPaneles() {
    ["registerScreen", "loginScreen", "adminScreen", "studentScreen"]
        .forEach(id => document.getElementById(id).classList.add("hidden"));
    cerrarModal();
}

function detenerEscucha() {
    if (detenerEscuchaTareas) {
        detenerEscuchaTareas();
        detenerEscuchaTareas = null;
    }
}

function mostrarPanel() {
    if (!usuarioActual) return;

    ocultarPaneles();

    if (usuarioActual.role === "administrador") {
        document.getElementById("adminScreen").classList.remove("hidden");
        document.getElementById("adminName").textContent = usuarioActual.nombre;
        document.getElementById("adminCourse").textContent =
            `${usuarioActual.curso} ${usuarioActual.paralelo}`;
        cargarTareasAdmin();
    } else {
        document.getElementById("studentScreen").classList.remove("hidden");
        document.getElementById("studentName").textContent = usuarioActual.nombre;
        document.getElementById("studentCourse").textContent =
            `${usuarioActual.curso} ${usuarioActual.paralelo}`;
        cargarTareasEstudiante();
    }
}

/* =================================================
   ADMIN — MODAL
================================================= */

function abrirModal() {
    if (!usuarioActual || usuarioActual.role !== "administrador") {
        alert("Tu cuenta no tiene permisos de administrador.");
        return;
    }

    const selector = document.getElementById("taskSubject");
    selector.innerHTML = '<option value="">Seleccionar materia</option>';

    (materiasPorCurso[usuarioActual.curso] || []).forEach(materia => {
        const opcion = document.createElement("option");
        opcion.value = materia;
        opcion.textContent = materia;
        selector.appendChild(opcion);
    });

    document.getElementById("taskModal").classList.remove("hidden");
}

function cerrarModal() {
    document.getElementById("taskModal").classList.add("hidden");
}

/* =================================================
   ADMIN — CREAR TAREA EN FIRESTORE
================================================= */

document.getElementById("taskForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    if (!usuarioActual || usuarioActual.role !== "administrador") {
        alert("Inicia sesión con una cuenta autorizada como administrador.");
        return;
    }

    const materia = document.getElementById("taskSubject").value;
    if (!materia) {
        alert("Selecciona una materia.");
        return;
    }

    const tarea = {
        titulo: document.getElementById("taskTitle").value.trim(),
        descripcion: document.getElementById("taskDescription").value.trim(),
        materia,
        tipo: document.getElementById("taskType").value,
        fecha: document.getElementById("taskDate").value,
        curso: usuarioActual.curso,
        paralelo: usuarioActual.paralelo,
        creadoPor: usuarioActual.uid,
        createdAt: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "tasks"), tarea);
        document.getElementById("taskForm").reset();
        cerrarModal();
        alert("Actividad registrada correctamente. ✅");
    } catch (error) {
        alert(mensajeError(error));
    }
});

/* =================================================
   PRIORIDAD
================================================= */

function obtenerPrioridad(fecha, completada) {
    if (completada) return { clase: "easy", texto: "✓ Completada" };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEntrega = new Date(fecha + "T00:00:00");
    const diferencia = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));

    if (diferencia <= 1) return { clase: "urgent", texto: "🔴 Urgente" };
    if (diferencia <= 6) return { clase: "medium", texto: "🟠 Próxima" };
    return { clase: "easy", texto: "🟢 Con tiempo" };
}

/* =================================================
   MOSTRAR TAREA
================================================= */

function crearHTMLTarea(tarea, estudiante = false) {
    const prioridad = obtenerPrioridad(tarea.fecha, tarea.completada);

    const fechaBonita = tarea.fecha
        ? new Date(tarea.fecha + "T00:00:00").toLocaleDateString("es-BO", {
            day: "numeric", month: "long", year: "numeric"
        })
        : "Sin fecha";

    const botonCompletar = estudiante && !tarea.completada
        ? `<br><button class="complete-btn" onclick="completarTarea('${escapeHTML(tarea.id)}')">✓ Marcar como completada</button>`
        : "";

    return `
        <div class="task ${prioridad.clase} ${tarea.completada ? "completed" : ""}">
            <div class="task-header">
                <div class="task-title">${escapeHTML(tarea.titulo)}</div>
                <div class="task-type">${escapeHTML(tarea.tipo)}</div>
            </div>
            <div class="task-subject">📚 ${escapeHTML(tarea.materia || "Sin materia")}</div>
            ${tarea.descripcion ? `<div class="task-description">${escapeHTML(tarea.descripcion)}</div>` : ""}
            <div class="task-date">📅 ${fechaBonita}</div>
            <div class="priority ${prioridad.clase}">${prioridad.texto}</div>
            ${botonCompletar}
        </div>
    `;
}

/* =================================================
   AGRUPAR POR MATERIA
================================================= */

function mostrarTareasPorMateria(contenedor, lista, estudiante) {
    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding:30px; opacity:.7">
                📚 Todavía no hay actividades.
            </div>`;
        return;
    }

    const grupos = {};
    lista.forEach(tarea => {
        const materia = tarea.materia || "Sin materia";
        if (!grupos[materia]) grupos[materia] = [];
        grupos[materia].push(tarea);
    });

    contenedor.innerHTML = Object.keys(grupos)
        .sort((a, b) => a.localeCompare(b, "es"))
        .map(materia => {
            const actividades = grupos[materia].sort(
                (a, b) => new Date(a.fecha) - new Date(b.fecha)
            );
            const pendientes = actividades.filter(t => !t.completada).length;

            return `
                <section class="materia-group">
                    <h3 class="materia-heading">
                        <span>📚 ${escapeHTML(materia)}</span>
                        ${pendientes > 0 ? `<span class="materia-badge">${pendientes}</span>` : ""}
                    </h3>
                    <div class="task-list">
                        ${actividades.map(tarea => crearHTMLTarea(tarea, estudiante)).join("")}
                    </div>
                </section>`;
        }).join("");
}

/* =================================================
   ADMIN — ESCUCHAR TAREAS DE SU CURSO
================================================= */

function cargarTareasAdmin() {
    if (!usuarioActual) return;
    detenerEscucha();

    const q = query(
        collection(db, "tasks"),
        where("curso", "==", usuarioActual.curso),
        where("paralelo", "==", usuarioActual.paralelo)
    );

    detenerEscuchaTareas = onSnapshot(q, snapshot => {
        const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data(), completada: false }));
        lista.sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
        mostrarTareasPorMateria(document.getElementById("adminTasks"), lista, false);
    }, error => alert(mensajeError(error)));
}

/* =================================================
   ESTUDIANTE — TAREAS Y COMPLETADO PERSONAL
================================================= */

async function cargarTareasEstudiante() {
    if (!usuarioActual) return;
    detenerEscucha();

    const uid = usuarioActual.uid;
    const q = query(
        collection(db, "tasks"),
        where("curso", "==", usuarioActual.curso),
        where("paralelo", "==", usuarioActual.paralelo)
    );

    detenerEscuchaTareas = onSnapshot(q, async snapshot => {
        try {
            const tareasUsuario = await Promise.all(snapshot.docs.map(async documento => {
                const referenciaCompletado = doc(db, "tasks", documento.id, "completions", uid);
                const completado = await getDoc(referenciaCompletado);

                return {
                    id: documento.id,
                    ...documento.data(),
                    completada: completado.exists() && completado.data().completada === true
                };
            }));

            tareasUsuario.sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));

            document.getElementById("totalTasks").textContent = tareasUsuario.length;
            document.getElementById("pendingTasks").textContent =
                tareasUsuario.filter(t => !t.completada).length;
            document.getElementById("doneTasks").textContent =
                tareasUsuario.filter(t => t.completada).length;

            mostrarTareasPorMateria(
                document.getElementById("studentTasks"),
                tareasUsuario,
                true
            );
        } catch (error) {
            alert(mensajeError(error));
        }
    }, error => alert(mensajeError(error)));
}

async function completarTarea(id) {
    if (!usuarioActual || usuarioActual.role !== "estudiante") return;

    try {
        await setDoc(
            doc(db, "tasks", id, "completions", usuarioActual.uid),
            {
                uid: usuarioActual.uid,
                completada: true,
                updatedAt: serverTimestamp()
            }
        );
    } catch (error) {
        alert(mensajeError(error));
    }
}

/* =================================================
   CAMBIAR ENTRE REGISTRO E INICIO
================================================= */

function mostrarLogin() {
    document.getElementById("registerScreen").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");
}

function mostrarRegistro() {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("registerScreen").classList.remove("hidden");
}

/* =================================================
   CERRAR SESIÓN
================================================= */

async function cerrarSesion() {
    cerrarModal();
    try {
        await signOut(auth);
    } catch (error) {
        alert(mensajeError(error));
    }
}

/* =================================================
   PROTEGER TEXTO
================================================= */

function escapeHTML(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =================================================
   FUNCIONES USADAS POR onclick EN index.html
================================================= */

window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.cerrarSesion = cerrarSesion;
window.completarTarea = completarTarea;
