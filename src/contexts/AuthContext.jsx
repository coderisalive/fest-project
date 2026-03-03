import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Define the master admin email directly here for demo/initial purposes
    const MASTER_ADMIN_EMAIL = 'ps5370572@gmail.com';

    const determineRole = (email) => {
        const lowerEmail = email.toLowerCase();
        // Main Admin: admin261@gmail.com, ps5370572@gmail.com
        if (lowerEmail === 'admin261@gmail.com' || lowerEmail === MASTER_ADMIN_EMAIL) {
            return 'admin';
        }
        // Sub Admin: siftain261@gmail.com
        if (lowerEmail === 'siftain261@gmail.com') {
            return 'sub-admin';
        }
        // Scorer: score261@gmail.com
        if (lowerEmail === 'score261@gmail.com') {
            return 'scorer';
        }
        return 'viewer';
    };

    async function login(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch their document immediately to ascertain role for redirection
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const role = userDoc.data().role;
                setUserRole(role);
                return role;
            } else {
                // If the user doesn't have a document, create one
                const newRole = determineRole(user.email);
                await setDoc(userDocRef, {
                    name: user.displayName || user.email,
                    email: user.email,
                    role: newRole,
                    createdAt: new Date().toISOString()
                });
                setUserRole(newRole);
                return newRole;
            }
        } catch (error) {
            console.error("Error fetching user role on login:", error);
            setUserRole('viewer');
            return 'viewer';
        }
    }

    async function signup(email, password, fullName, collegeName, gender) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const newRole = determineRole(user.email);
        const userDocRef = doc(db, 'users', user.uid);

        await setDoc(userDocRef, {
            name: fullName || user.email,
            email: user.email,
            role: newRole,
            college: collegeName || 'N/A',
            gender: gender || 'N/A',
            createdAt: new Date().toISOString()
        });

        setUserRole(newRole);
        return newRole;
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch or assign role in Firestore
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role);
                    } else {
                        // Document doesn't exist, create it.
                        const newRole = determineRole(user.email);

                        await setDoc(userDocRef, {
                            name: user.displayName || user.email,
                            email: user.email,
                            role: newRole,
                            createdAt: new Date().toISOString()
                        });
                        setUserRole(newRole);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setUserRole('viewer'); // Default fallback safely
                }
            } else {
                setUserRole(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
