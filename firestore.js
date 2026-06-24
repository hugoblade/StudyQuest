import { db } from './config';
import {
    doc,
    getDoc,
    updateDoc,
    setDoc,
    collection,
    query,
    orderBy,
    getDocs,
    limit,
    addDoc
} from 'firebase/firestore';

// Get user data by UID
export const getUserData = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};

// Add XP to a user — also syncs leaderboard
export const addXP = async (uid, xpGain) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const currentXP = userSnap.data().xp || 0;
        const newXP = currentXP + xpGain;

        // Update user XP
        await updateDoc(userRef, { xp: newXP });

        // Sync leaderboard — setDoc with merge creates it if missing
        const leaderboardRef = doc(db, 'leaderboard', uid);
        await setDoc(leaderboardRef, {
            uid,
            name: userSnap.data().username || userSnap.data().name || 'Unknown',
            xp: newXP,
            level: userSnap.data().level || 1
        }, { merge: true });
    }
};

// Log a study session
export const logStudySession = async (uid, sessionData) => {
    const sessionsRef = collection(db, 'users', uid, 'sessions');
    await addDoc(sessionsRef, {
        ...sessionData,
        timestamp: new Date().toISOString(),
    });
    await addXP(uid, sessionData.xp);
};

// Get recent sessions for a user
export const getRecentSessions = async (uid, limitCount = 5) => {
    const sessionsRef = collection(db, 'users', uid, 'sessions');
    const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get user badges
export const getUserBadges = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().badges || [] : [];
};

// Get leaderboard (top users by XP)
export const getLeaderboard = async (limitCount = 10) => {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(leaderboardRef, orderBy('xp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get all users (for admin)
export const getAllUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Award a badge to a user
export const addBadgeToUser = async (uid, badgeName) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const currentBadges = userSnap.data().badges || [];
        if (!currentBadges.some(b => b.name === badgeName)) {
            const newBadge = {
                id: Date.now().toString(),
                name: badgeName,
                earned: true,
                xpBonus: 50
            };
            await updateDoc(userRef, { badges: [...currentBadges, newBadge] });
            await addXP(uid, 50);
        }
    }
};