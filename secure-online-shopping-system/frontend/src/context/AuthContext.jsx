import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'user' or 'admin'
    const [loading, setLoading] = useState(true);

    // Sign up function
    async function signup(email, password, role = 'user') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore with Role
        // SECURE: Enforce RBAC at database level
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: role, // default to user, admins must be manually promoted or via secure script
            createdAt: new Date()
        });

        return user;
    }

    // Login function
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Logout function
    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        let mounted = true;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!mounted) return;
            setCurrentUser(user);
            if (user) {
                // Fetch user role for frontend logic (Security rules still enforce it on backend)
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserRole(docSnap.data().role);
                    }
                } catch (e) {
                    console.error("Error fetching user role:", e);
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Auth state change error:", error);
            setLoading(false);
        });

        // Fallback timeout in case Firebase doesn't respond (e.g., missing config)
        const timeout = setTimeout(() => {
            if (loading && mounted) {
                console.warn("Auth check timed out - assuming no user");
                setLoading(false);
            }
        }, 3000);

        return () => {
            mounted = false;
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        logout
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
