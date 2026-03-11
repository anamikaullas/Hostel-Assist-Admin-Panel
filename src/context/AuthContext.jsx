import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role === "admin") {
              setCurrentUser(user);
              setUserData(data);
            } else {
              await signOut(auth);
              setError("Access denied. Admin role required.");
            }
          } else {
            // User exists in Auth but not in Firestore users collection
            // This might happen if admin is created manually in console
            setCurrentUser(user);
            setUserData({
              role: "admin",
              fullName: user.displayName || "Admin",
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Error checking authorization.");
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    setError(null);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, fullName, phoneNumber) => {
    setError(null);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: fullName,
      });

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phoneNumber,
        role: "admin",
        createdAt: new Date().toISOString(),
        isActive: true,
      });

      return userCredential;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    userData,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
