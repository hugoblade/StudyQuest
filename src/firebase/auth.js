// ================================
// STUDYQUEST - Firebase Auth
// Login, Register, Logout functions
// ================================

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
// REGISTER NEW USER
// ================================
export const registerUser = async (name, email, password) => {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName: name });

        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: "student",
            xp: 0,
            level: 1,
            badges: [],
            streak: 0,
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp()
        });

        // Save to leaderboard
        await setDoc(doc(db, "leaderboard", user.uid), {
            uid: user.uid,
            name: name,
            xp: 0,
            level: 1
        });

        return { success: true, user };

    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ================================
// LOGIN EXISTING USER
// ================================
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return { success: true, user: userCredential.user };

    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ================================
// LOGOUT USER
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
// GET USER DATA FROM FIRESTORE
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