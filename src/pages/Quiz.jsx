import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

// ================================
// REGISTER
// ================================
export const registerUser = async (name, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email,
            role: "student",
            xp: 0,
            level: 1,
            badges: [],
            streak: 0,
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp()
        });
        await setDoc(doc(db, "leaderboard", user.uid), {
            uid: user.uid,
            name,
            xp: 0,
            level: 1
        });
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ================================
// LOGIN   <-- THIS IS WHAT YOU NEED
// ================================
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ================================
// LOGOUT
// ================================
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ================================
// GET USER DATA
// ================================
export const getUserData = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: false, error: "User not found" };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ================================
// RESET PASSWORD
// ================================
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ================================
// REFRESH TOKEN (NEW)
// ================================
export const refreshToken = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is logged in. Please log in again.");
    }
    try {
        await user.getIdToken(true);
        console.log("✅ Token refreshed!");
        return { success: true };
    } catch (error) {
        throw new Error("Session expired. Please logout and login again.");
    }
};
