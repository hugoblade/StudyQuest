// ================================
// STUDYQUEST - AuthContext
// Global authentication state
// Matches the login/register/logout API
// already used by Profile.jsx and Login.jsx
// ================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData]       = useState(null);
  const [loading, setLoading]         = useState(true);

  // ================================
  // FETCH USER DATA FROM FIRESTORE
  // Combines Auth user + Firestore document
  // into one currentUser object
  // ================================
  const fetchUserData = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setUserData(null);
      return;
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const data = userDoc.exists() ? userDoc.data() : null;
    setUserData(data);

    setCurrentUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      username: data?.name || data?.username || user.displayName,
      xp: data?.xp || 0,
      level: data?.level || 1,
      isAdmin: data?.role === 'admin'
    });
  };

  // ================================
  // REFRESH USER DATA
  // Call after updating profile, XP, or badges
  // so the UI shows the latest values
  // ================================
  const refreshUserData = async () => {
    if (auth.currentUser) {
      await fetchUserData(auth.currentUser);
    }
  };

  // ================================
  // LOGIN
  // ================================
  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // ================================
  // REGISTER
  // ================================
  const register = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: username });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      name: username,
      role: 'student',
      xp: 0,
      level: 1,
      badges: [],
      createdAt: new Date().toISOString(),
    });

    await fetchUserData(user);
  };

  // ================================
  // LOGOUT
  // ================================
  const logout = async () => {
    await signOut(auth);
  };

  // ================================
  // LISTEN FOR AUTH STATE CHANGES
  // ================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await fetchUserData(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    register,
    logout,
    loading,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
