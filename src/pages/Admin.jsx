import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("utilisateur");

  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const snap = await getDocs(collection(db, "utilisateurs"));
        const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUtilisateurs(users);
      } catch (err) {
        console.error("Erreur de chargement des utilisateurs :", err);
        alert("Impossible de charger les utilisateurs (voir console).");
      } finally {
        setUsersLoading(false);
      }
    };
    run();
  }, []);

  const supprimerUtilisateur = async (uid, email) => {
    if (!window.confirm(`Supprimer ${email} uniquement de Firestore ?`)) return;

    try {
      await deleteDoc(doc(db, "utilisateurs", uid));
      setUtilisateurs((prev) => prev.filter((u) => u.id !== uid));
      alert(`Utilisateur ${email} supprimé de Firestore.`);
    } catch (error) {
      console.error("Erreur suppression Firestore :", error);
      alert("Erreur suppression Firestore : " + error.message);
    }
  };

  const desactiverUtilisateur = async (id, actif) => {
    const nouvelleValeur = !actif;
    try {
      await updateDoc(doc(db, "utilisateurs", id), { actif: nouvelleValeur });
      setUtilisateurs((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, actif: nouvelleValeur } : u
        )
      );
      alert(`Utilisateur ${nouvelleValeur ? "réactivé" : "désactivé"} avec succès.`);
    } catch (err) {
      console.error("Erreur désactivation :", err);
      alert("Erreur lors du changement d'état actif.");
    }
  };

  const creerUtilisateur = async () => {
    if (!newUserEmail || !newUserPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    try {
     
      const cred = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
      await setDoc(doc(db, "utilisateurs", cred.user.uid), {
        email: newUserEmail,
        role: newUserRole, 
        actif: true,
        createdAt: new Date()
      });
      alert("Utilisateur créé.");
      setUtilisateurs((prev) => [
        ...prev,
        {
          id: cred.user.uid,
          email: newUserEmail,
          role: newUserRole,
          actif: true,
          createdAt: new Date()
        },
      ]);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("utilisateur");
    } catch (err) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },         
        py: { xs: 2, md: 4 },
        maxWidth: 1200,               
        mx: "auto",                   
      }}
    >
      <Typography variant="h4" mb={3} sx={{ fontSize: { xs: 24, md: 32 } }}>
        Tableau de bord Admin
      </Typography>

      <Typography variant="h6" mb={2}>Utilisateurs</Typography>
      {usersLoading ? (
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
          <CircularProgress size={20} /> <span>Chargement…</span>
        </Stack>
      ) : (
        <Stack spacing={2}>
          {utilisateurs.map((u) => (
            <Paper key={u.id} sx={{ p: 2 }} elevation={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}                 
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent={{ xs: "flex-start", sm: "space-between" }}
                spacing={{ xs: 1.5, sm: 0 }}
              >
                <Box sx={{ minWidth: { sm: 280 } }}>
                  <Typography><strong>Email :</strong> {u.email || "(inconnu)"} </Typography>
                  <Typography><strong>Rôle :</strong> {u.role}</Typography>
                  <Typography><strong>Actif :</strong> {u.actif === false ? "Non" : "Oui"}</Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}              
                  spacing={1}
                  sx={{ width: { xs: "100%", sm: "auto" }, mt: { xs: 1, sm: 0 } }}
                >
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => supprimerUtilisateur(u.id, u.email)}
                    fullWidth                                         
                  >
                    Supprimer
                  </Button>
                  <Button
                    variant="contained"
                    color={u.actif === false ? "success" : "warning"}
                    onClick={() => desactiverUtilisateur(u.id, u.actif)}
                    fullWidth
                  >
                    {u.actif === false ? "Réactiver" : "Désactiver"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
          {utilisateurs.length === 0 && (
            <Paper sx={{ p:2 }}>
              <Typography>Aucun utilisateur pour le moment.</Typography>
            </Paper>
          )}
        </Stack>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" mb={2}>Créer un nouvel utilisateur</Typography>
      <Stack
        spacing={2}
        direction={{ xs: "column", md: "row" }}      
        alignItems={{ xs: "stretch", md: "center" }}
        flexWrap="wrap"
      >
        <TextField
          label="Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          fullWidth
          sx={{ minWidth: { md: 240 } }}
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          fullWidth
          sx={{ minWidth: { md: 240 } }}
        />
        <TextField
          select
          label="Rôle"
          value={newUserRole}
          onChange={(e) => setNewUserRole(e.target.value)}
          fullWidth
          sx={{ minWidth: { md: 200 } }}
        >
          <MenuItem value="utilisateur">Utilisateur</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </TextField>
        <Button variant="contained" onClick={creerUtilisateur} sx={{ alignSelf: { md: "center" } }} fullWidth>
          Créer
        </Button>
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" mb={2}>Modifier les contenus informatifs</Typography>
      <Stack spacing={3}>
        {["santeMentale", "stress", "aPropos"].map((id) => (
          <ContenuEditor key={id} id={id} />
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />
      <Button variant="contained" onClick={() => navigate("/")}>Retour à l'accueil</Button>
    </Box>
  );
}

function ContenuEditor({ id }) {
  const [texte, setTexte] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "informations", id));
        setTexte(snap.exists() ? snap.data().texte : "");
      } catch (e) {
        console.error("Erreur chargement contenu", id, e);
        alert("Impossible de charger le contenu " + id);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "informations", id), { texte }, { merge: true });
      alert("Contenu enregistré !");
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
      console.error(err);
    }
  };

  const titres = {
    santeMentale: "Santé mentale",
    stress: "Gestion du stress",
    aPropos: "À propos",
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>{titres[id]}</Typography>
      <TextField
        label="Contenu"
        multiline
        fullWidth
        rows={6}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        disabled={loading}
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
        <Button onClick={handleSave} variant="contained" fullWidth disabled={loading}>
          Enregistrer
        </Button>
      </Stack>
    </Paper>
  );
}
