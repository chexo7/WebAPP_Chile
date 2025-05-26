import { User } from 'firebase/auth';
import { ref, DatabaseReference } from 'firebase/database';
import { database } from './firebase'; // Your Firebase initialization

// --- IMPORTANT ---
// This is a placeholder mapping. You MUST replace this with your actual
// Firebase UID to user-specific database path logic.
// For example, if your Firebase UIDs are 'uid123', 'uid456'
// and they map to database paths 'userSS', 'userJOSE' respectively.
const uidToUserPathMap: Record<string, string> = {
  // Example:
  // "firebaseUidForUserSS": "SS",
  // "firebaseUidForUserJose": "JOSE",
  // Add more mappings as needed.
  // If you have a different way to determine the user's data path (e.g., from a custom claim),
  // implement that logic here.
  "defaultUser": "TEST_USER" // A fallback/test user path
};

/**
 * Gets the Firebase database reference for a specific user's data.
 * @param user The Firebase User object.
 * @returns A DatabaseReference to the user's data path, or null if user is not found or mapping doesn't exist.
 */
export const getUserBaseRef = (user: User | null): DatabaseReference | null => {
  if (!user || !user.uid) {
    console.error("User or User UID is null/undefined.");
    return null;
  }

  // Attempt to get the specific user path from the map
  let userPathSegment = uidToUserPathMap[user.uid];

  // If no specific path is found for the UID, you might:
  // 1. Fallback to a default (like "defaultUser" for testing)
  // 2. Return null or throw an error if a mapping is strictly required.
  if (!userPathSegment) {
    console.warn(`No specific data path found for UID: ${user.uid}. Falling back to 'defaultUser'.`);
    userPathSegment = uidToUserPathMap["defaultUser"]; // Or handle as an error
  }
  
  if (!userPathSegment) {
    console.error("User path segment could not be determined.");
    return null;
  }

  // Construct the full path, e.g., "users/SS"
  const fullPath = `users/${userPathSegment}`;
  return ref(database, fullPath);
};


/**
 * Gets the Firebase database reference for a specific user's backups.
 * @param user The Firebase User object.
 * @returns A DatabaseReference to the user's backups path, or null.
 */
export const getUserBackupsRef = (user: User | null): DatabaseReference | null => {
  const userBase = getUserBaseRef(user);
  return userBase ? ref(database, `${userBase.key}/backups`) : null;
};

/**
 * Gets the Firebase database reference for a specific backup file of a user.
 * @param user The Firebase User object.
 * @param backupKey The specific backup key (timestamp string).
 * @returns A DatabaseReference to the specific backup file, or null.
 */
export const getSpecificBackupRef = (user: User | null, backupKey: string): DatabaseReference | null => {
  const userBackups = getUserBackupsRef(user);
  return userBackups && backupKey ? ref(database, `${userBackups.key}/${backupKey}`) : null;
};

/**
 * Gets the Firebase database reference for the user's main data (not a backup).
 * @param user The Firebase User object.
 * @returns A DatabaseReference, or null.
 */
export const getUserMainDataRef = (user: User | null): DatabaseReference | null => {
    const userBase = getUserBaseRef(user);
    return userBase ? ref(database, `${userBase.key}/data`) : null;
};

/**
 * Gets the Firebase database reference for the user's change log.
 * @param user The Firebase User object.
 * @returns A DatabaseReference, or null.
 */
export const getUserChangeLogRef = (user: User | null): DatabaseReference | null => {
    const userBase = getUserBaseRef(user);
    return userBase ? ref(database, `${userBase.key}/changeLog`) : null;
};
