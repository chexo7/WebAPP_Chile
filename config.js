// Configuración de Firebase y rutas de datos

// Reemplaza el contenido de firebaseConfig con los valores de tu proyecto
const firebaseConfig = {
    apiKey: "AIzaSyCRiIrcgwdDRERdyAjanVHBsNfSdmm5COs",
    authDomain: "cash-flow-app-chile.firebaseapp.com",
    databaseURL: "https://cash-flow-app-chile-default-rtdb.firebaseio.com",
    projectId: "Tcash-flow-app-chile",
    storageBucket: "cash-flow-app-chile.firebasestorage.app",
    messagingSenderId: "363279849526",
    appId: "1:363279849526:web:71bc23cceb2e24a3d4a097"
};

// Mapea los UID de Firebase a las sub-rutas de datos dentro de /users
// Modifica este objeto según tus propios usuarios
const USER_PATHS = {
    "POurDKWezHXAsAQ9v86zT2KIHNH2": "SS",
    "eLmByfa8isM6r37aMNUajpp2GG72": "SS",
    "eqFrOEklfEREaBDYgr761ipHPQK2": "JOSE",
    "0ceYKka1nbZfyftQlVE0jFRUeY73": "PAPAS",
    "y0kGbOIqurc0kDmdWzl6YHWQ9IX2": "PAPAS",
    "d4GAITAu8iP75h8aUqaDXeqMoc02": "VICENTE",
    "R9NBQQt73nUPvJlGLQhIgmaYFJk2": "SS-USA"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Servicios principales
const auth = firebase.auth();
const database = firebase.database();

// Clave para acceder a la API de Gemini
const GEMINI_API_KEY = "AIzaSyB_IazCUbRrYp96Em5s3z5MXXfBEbCC86o";

// --- Funciones de utilidad ---

/**
 * Obtiene la ruta de datos relativa para el UID dado.
 * @param {string} uid
 * @returns {string|null}
 */
function getUserDataPath(uid) {
    const sub = USER_PATHS[uid];
    return sub ? `users/${sub}` : null;
}

/**
 * Devuelve una referencia a la ruta de datos para el UID dado.
 * @param {string} uid
 * @returns {firebase.database.Reference|null}
 */
function getUserDataRefByUID(uid) {
    const path = getUserDataPath(uid);
    return path ? database.ref(path) : null;
}

/**
 * Devuelve una referencia a la ruta de datos del usuario autenticado actual.
 * @returns {firebase.database.Reference|null}
 */
function getUserDataRef() {
    const user = auth.currentUser;
    return user ? getUserDataRefByUID(user.uid) : null;
}

/**
 * Devuelve una referencia al bloqueo de edición para el UID dado.
 * @param {string} uid
 * @returns {firebase.database.Reference|null}
 */
function getEditLockRefByUID(uid) {
    const path = getUserDataPath(uid);
    return path ? database.ref(`${path}/edit_lock`) : null;
}

/**
 * Devuelve una referencia al bloqueo de edición para el usuario actual.
 * @returns {firebase.database.Reference|null}
 */
function getEditLockRef() {
    const user = auth.currentUser;
    return user ? getEditLockRefByUID(user.uid) : null;
}
