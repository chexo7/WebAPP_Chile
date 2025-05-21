// Contenido de config_manager.js

/**
 * Helper function to parse Firebase config from a string representation.
 * It extracts the object literal assigned to 'firebaseConfig'.
 * @param {string} configStr - The string containing the Firebase config.
 * @returns {object|null} The parsed Firebase config object or null if parsing fails.
 */
function parseFirebaseConfigString(configStr) {
    // Regular expression to find "const firebaseConfig = { ... };"
    // It captures the content within the curly braces.
    const match = /const\s+firebaseConfig\s*=\s*(\{[\s\S]*?\});/.exec(configStr);
    if (!match || !match[1]) {
        console.error("Could not extract firebaseConfig object from string:", configStr);
        return null;
    }

    let objectStr = match[1];
    
    // Attempt to make the string more JSON-like:
    // 1. Replace unquoted keys (e.g., apiKey:) with quoted keys ("apiKey":)
    // This handles typical JavaScript object literal syntax.
    objectStr = objectStr.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
    
    // 2. Remove trailing commas before '}' or ']' which are invalid in strict JSON
    // e.g., { key: "value", } -> { key: "value" }
    objectStr = objectStr.replace(/,\s*(\}|])/g, '$1');
    
    try {
        // Attempt to parse the transformed string as JSON.
        return JSON.parse(objectStr);
    } catch (e) {
        console.error("Failed to parse firebaseConfig object string after transformations:", objectStr, e);
        // If JSON.parse fails, it might be due to comments or other non-JSON elements
        // A more robust (but complex) approach might involve a proper JavaScript parser
        // or more sophisticated regex, but for typical Firebase config objects, this often suffices.
        return null;
    }
}

// Define all Firebase configurations here.
// Each entry includes an ID, the target UID for matching, a unique appName for Firebase initialization,
// the config string (as provided), and the actual databaseURL.
const firebaseConfigurations = [
    {
        id: "papas_m4z",
        targetUid: "M4zXba5rkfgJfMYc9MhHdRxqVUC2",
        appName: "firebaseAppPapasM4z", // Unique name for firebase.initializeApp()
        configString: `const firebaseConfig = { apiKey: "AIzaSyAnmG71YjotxrLp1EDxbprkWPm_H96xZTc", authDomain: "papas-eadc5.firebaseapp.com", databaseURL: "https://papas-eadc5-default-rtdb.firebaseio.com", projectId: "papas-eadc5", storageBucket: "papas-eadc5.appspot.com", messagingSenderId: "490297381750", appId: "1:490297381750:web:57182c702d8a4ca4862057", measurementId: "G-RXY4D8ESYS" };`,
        actualDatabaseURL: "https://papas-eadc5-default-rtdb.firebaseio.com"
    },
    {
        id: "papas_qjw",
        targetUid: "qJwqHPCxYsbzJgnMPBRQQV2oO2k1",
        appName: "firebaseAppPapasQjw",
        configString: `const firebaseConfig = { apiKey: "AIzaSyAnmG71YjotxrLp1EDxbprkWPm_H96xZTc", authDomain: "papas-eadc5.firebaseapp.com", databaseURL: "https://papas-eadc5-default-rtdb.firebaseio.com", projectId: "papas-eadc5", storageBucket: "papas-eadc5.appspot.com", messagingSenderId: "490297381750", appId: "1:490297381750:web:57182c702d8a4ca4862057", measurementId: "G-RXY4D8ESYS" };`,
        actualDatabaseURL: "https://papas-eadc5-default-rtdb.firebaseio.com"
    },
    {
        id: "jose_5jo",
        targetUid: "5jOnjKxO1AXEZhZ2Sghg0j8JXkK2",
        appName: "firebaseAppJose5jo",
        configString: `const firebaseConfig = { apiKey: "AIzaSyA2c8ZDnP-vdN2pV9whwmkcT0Z6Q3BzU9g", authDomain: "jose-ff673.firebaseapp.com", databaseURL: "https://jose-ff673-default-rtdb.firebaseio.com", projectId: "jose-ff673", storageBucket: "jose-ff673.appspot.com", messagingSenderId: "893233886735", appId: "1:893233886735:web:dbea7752536d543588957a", measurementId: "G-RZZZ5VD39S" };`,
        actualDatabaseURL: "https://jose-ff673-default-rtdb.firebaseio.com"
    },
    {
        id: "vicente_u18",
        targetUid: "u18BeCRgUBdGFv9NXo9KdAvVH7D3",
        appName: "firebaseAppVicenteU18",
        configString: `const firebaseConfig = { apiKey: "AIzaSyDjgclxmd9rj_ezAG2dBSXfyOYzmqx2XD0", authDomain: "vicente-57f9e.firebaseapp.com", databaseURL: "https://vicente-57f9e-default-rtdb.firebaseio.com", projectId: "vicente-57f9e", storageBucket: "vicente-57f9e.appspot.com", messagingSenderId: "24826378170", appId: "1:24826378170:web:f57511072f2ed742ce4f83", measurementId: "G-1THL4GRSLG" };`,
        actualDatabaseURL: "https://vicente-57f9e-default-rtdb.firebaseio.com"
    }
];

// Parse all config strings into config objects upon script load.
firebaseConfigurations.forEach(confEntry => {
    confEntry.config = parseFirebaseConfigString(confEntry.configString);
    
    // Ensure databaseURL from the parsed config object matches actualDatabaseURL.
    // If databaseURL is missing in the parsed config, set it from actualDatabaseURL.
    // This is important if the config string doesn't explicitly include databaseURL
    // but it's known and required for database operations.
    if (confEntry.config && !confEntry.config.databaseURL && confEntry.actualDatabaseURL) {
        confEntry.config.databaseURL = confEntry.actualDatabaseURL;
    }

    // Example of correcting storageBucket URL if needed.
    // Firebase storage buckets usually end with '.appspot.com'.
    // If the provided config string has a different format (e.g., '.firebasestorage.app'),
    // it might need adjustment for certain SDK operations, though often the SDK handles variations.
    // This is commented out as it depends on specific Firebase project setup and SDK behavior.
    /*
    if (confEntry.config && confEntry.config.storageBucket && !confEntry.config.storageBucket.endsWith('.appspot.com')) {
        console.warn(`Storage bucket for ${confEntry.id} (${confEntry.config.storageBucket}) does not end with .appspot.com. This might be an issue for some operations.`);
        // Example correction:
        // if (confEntry.config.storageBucket === "papas-eadc5.firebasestorage.app") {
        //     confEntry.config.storageBucket = "papas-eadc5.appspot.com";
        // }
    }
    */
});
