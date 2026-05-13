// Firebase Firestore wrapper for user profile persistence
// Requires Firebase CDN scripts loaded before this file
// Requires CONFIG.FIREBASE set in js/config.js

const DB = (() => {
  let db = null;

  function firebaseConfig() {
    return (typeof CONFIG !== 'undefined') ? CONFIG.FIREBASE : undefined;
  }

  function init() {
    if (db) return true;
    const cfg = firebaseConfig();
    if (typeof firebase === 'undefined' || !cfg) return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      db = firebase.firestore();
      return true;
    } catch (e) {
      console.warn('[DB] init failed:', e.message);
      return false;
    }
  }

  // Use base64 of email as document ID (safe characters)
  function docId(email) {
    return btoa(email.toLowerCase().trim()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async function getProfile(email) {
    if (!init()) return null;
    try {
      const snap = await db.collection('user_profiles').doc(docId(email)).get();
      return snap.exists ? snap.data() : null;
    } catch (e) {
      console.warn('[DB] getProfile error:', e.message);
      return null;
    }
  }

  async function saveProfile(profile) {
    if (!init()) return;
    try {
      // merge:true preserves Firestore fields not in profile (e.g. cityHistory)
      await db.collection('user_profiles').doc(docId(profile.email)).set(profile, { merge: true });
    } catch (e) {
      console.warn('[DB] saveProfile error:', e.message);
    }
  }

  // Append city change to history without overwriting previous entries
  async function appendCityHistory(email, cityEntry) {
    if (!init()) return;
    try {
      await db.collection('user_profiles').doc(docId(email)).update({
        cityHistory: firebase.firestore.FieldValue.arrayUnion(cityEntry),
      });
    } catch (e) {
      console.warn('[DB] appendCityHistory error:', e.message);
    }
  }

  async function logEvent(event) {
    if (!init()) return;
    try {
      await db.collection('events').add(event);
    } catch (e) {
      console.warn('[DB] logEvent error:', e.message);
    }
  }

  async function getEvents(limitCount) {
    if (!init()) return [];
    try {
      const snap = await db.collection('events')
        .orderBy('timestamp', 'desc')
        .limit(limitCount || 2000)
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[DB] getEvents error:', e.message);
      return [];
    }
  }

  return { getProfile, saveProfile, appendCityHistory, logEvent, getEvents };
})();
