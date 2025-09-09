import React, { useEffect, useState, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import Header from "./components/Header";
import Accueil from "./pages/Accueil";
import Diagnostique from "./pages/Diagnostique";
import Exercices from "./pages/Exercices";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import SanteMentale from "./pages/SanteMentale";
import Stress from "./pages/Stress";
import APropos from "./pages/APropos";
import Profil from "./pages/Profil";
import Admin from "./pages/Admin";
import Historique from "./pages/Historique";

const AuthCtx = createContext({ user: null, role: "guest", actif: true, loading: true });
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, role: "guest", actif: true, loading: true });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setState({ user: null, role: "guest", actif: true, loading: false });
        return;
      }

      let role = "utilisateur";   
      let actif = true;           

      try {
        const ref = doc(db, "utilisateurs", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          role = data.role || "utilisateur";
          actif = data.actif !== false; 
        } else {
          await setDoc(
            ref,
            { role: "utilisateur", actif: true, email: u.email || null, createdAt: new Date() },
            { merge: true }
          );
        }
      } catch (e) {
        console.warn("Lecture/initialisation utilisateur échouée, fallback {role:'utilisateur', actif:true}", e);
      }

      setState({ user: u, role, actif, loading: false });
    });

    return () => unsub();
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

function RequireAuth({ children }) {
  const { loading, user, actif } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Chargement…</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (!actif) {
    signOut(auth).catch(() => {});
    return <Navigate to="/connexion" replace />;
  }
  return children;
}

function RequireRole({ children, accept = ["admin"] }) {
  const { loading, user, role, actif } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Chargement…</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (!actif) {
    signOut(auth).catch(() => {});
    return <Navigate to="/connexion" replace />;
  }
  if (!accept.includes(role)) return <Navigate to="/" replace />; 
  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/diagnostique" element={<Diagnostique />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/sante-mentale" element={<SanteMentale />} />
            <Route path="/gestion-stress" element={<Stress />} />
            <Route path="/a-propos" element={<APropos />} />

            <Route
              path="/exercices"
              element={
                <RequireAuth>
                  <Exercices />
                </RequireAuth>
              }
            />
            <Route
              path="/profil"
              element={
                <RequireAuth>
                  <Profil />
                </RequireAuth>
              }
            />
            <Route
              path="/historique"
              element={
                <RequireAuth>
                  <Historique />
                </RequireAuth>
              }
            />

            <Route
              path="/admin"
              element={
                <RequireRole accept={["admin"]}>
                  <Admin />
                </RequireRole>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
