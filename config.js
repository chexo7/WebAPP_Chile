// config.js

// Default Firebase project configuration (cash-flow-app-chile)
const defaultFirebaseConfig = {
    apiKey: "AIzaSyCRiIrcgwdDRERdyAjanVHBsNfSdmm5COs",
    authDomain: "cash-flow-app-chile.firebaseapp.com",
    databaseURL: "https://cash-flow-app-chile-default-rtdb.firebaseio.com",
    projectId: "cash-flow-app-chile", // Verified this matches the structure of databaseURL
    storageBucket: "cash-flow-app-chile.appspot.com", // Common pattern, verify if needed
    messagingSenderId: "363279849526",
    appId: "1:363279849526:web:71bc23cceb2e24a3d4a097"
};

// Configuration for the "papas" Firebase project (papas-eadc5)
const papasFirebaseConfig = {
    apiKey: "AIzaSyAnmG71YjotxrLp1EDxbprkWPm_H96xZTc",
    authDomain: "papas-eadc5.firebaseapp.com",
    databaseURL: "https://papas-eadc5-default-rtdb.firebaseio.com",
    projectId: "papas-eadc5",
    storageBucket: "papas-eadc5.firebasestorage.app", // Corrected from .appspot.com to .firebasestorage.app as per your snippet
    messagingSenderId: "490297381750",
    appId: "1:490297381750:web:57182c702d8a4ca4862057",
    measurementId: "G-RXY4D8ESYS" // Added measurementId
};

// Initialize Firebase Apps
// Ensure apps are initialized only once
let defaultApp;
if (!firebase.apps.some(app => app.name === "DEFAULT_APP")) {
    defaultApp = firebase.initializeApp(defaultFirebaseConfig, "DEFAULT_APP");
} else {
    defaultApp = firebase.app("DEFAULT_APP");
}

let papasApp;
// Check if the API key is valid (not a placeholder) before initializing.
if (papasFirebaseConfig.apiKey && papasFirebaseConfig.apiKey !== "YOUR_PAPAS_API_KEY") { // Check against a generic placeholder
    if (!firebase.apps.some(app => app.name === "PapasApp")) {
        papasApp = firebase.initializeApp(papasFirebaseConfig, 'PapasApp');
    } else {
        papasApp = firebase.app("PapasApp");
    }
} else {
    console.warn("PapasApp Firebase configuration might be incomplete or still using placeholders. Please ensure config.js has the correct credentials for 'papasFirebaseConfig'.");
    // papasApp will not be initialized correctly if config is incomplete.
}


// Auth service will be from the default app (handles user login/logout)
const auth = defaultApp.auth();

// 'database' will be reassigned by initializeUserDatabase based on the logged-in user
let database;

const userToAppMap = {
    "M4zXba5rkfgJfMYc9MhHdRxqVUC2": "PapasApp",
    "qJwqHPCxYsbzJgnMPBRQQV2oO2k1": "PapasApp"
    // Add other UIDs if they need to map to PapasApp or other apps
};

// Function to set the correct database instance
function initializeUserDatabase(uid) {
    const targetAppName = userToAppMap[uid];

    if (targetAppName === "PapasApp" && papasApp) {
        console.log("Switching to PapasApp database for user:", uid);
        database = papasApp.database();
    } else {
        if (targetAppName === "PapasApp" && !papasApp) {
            console.error("Attempted to switch to PapasApp, but it's not properly initialized. Check papasFirebaseConfig. Using default database as fallback.");
        }
        console.log("Using DEFAULT_APP database for user:", uid || "Guest/Default");
        database = defaultApp.database();
    }
}

// Initialize with the default database before any user logs in
initializeUserDatabase(null);
