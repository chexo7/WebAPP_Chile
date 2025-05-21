// Reemplaza esto con la configuración de tu proyecto Firebase
// (Obtenla desde Firebase Console > Configuración del proyecto > Tus apps > SDK de Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyCRiIrcgwdDRERdyAjanVHBsNfSdmm5COs",
    authDomain: "cash-flow-app-chile.firebaseapp.com",
    databaseURL: "https://cash-flow-app-chile-default-rtdb.firebaseio.com", // Ej: "https://cash-flow-app-chile-default-rtdb.firebaseio.com"
    projectId: "Tcash-flow-app-chile",     // Ej: "cash-flow-app-chile"
    storageBucket: "cash-flow-app-chile.firebasestorage.app",
    messagingSenderId: "363279849526",
    appId: "1:363279849526:web:71bc23cceb2e24a3d4a097"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();