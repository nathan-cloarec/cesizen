import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
  Stack,
} from "@mui/material";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState(null);
  const navigate = useNavigate();

  const handleConnexion = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDocRef = doc(db, "utilisateurs", uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        alert("Profil introuvable dans Firestore.");
        await signOut(auth);
        return;
      }

      const userData = userSnap.data();
      if (userData.actif === false) {
        alert("Ce compte a été désactivé par un administrateur.");
        await signOut(auth);
        return;
      }

      console.log("Connecté avec succès :", userCredential.user);
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion :", error);
      if (error.code === "auth/user-not-found") {
        alert("Utilisateur non trouvé.");
      } else if (error.code === "auth/wrong-password") {
        alert("Mot de passe incorrect.");
      } else {
        alert("Erreur : " + error.message);
      }
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ type: "success", text: "📧 Un email de réinitialisation a été envoyé !" });
    } catch (error) {
      console.error("Erreur de réinitialisation :", error);
      setResetMessage({ type: "error", text: "Erreur : " + error.message });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#E3F2FD",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 4,
          boxShadow: 6,
          backgroundColor: "#ffffffee",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          mb={3}
          sx={{ color: "#1976D2", fontWeight: "bold" }}
        >
          Connexion à CESIZen
        </Typography>

        <form onSubmit={handleConnexion}>
          <Stack spacing={2}>
            <TextField
              label="Adresse email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Mot de passe"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <MuiLink
              component="button"
              variant="body2"
              underline="hover"
              onClick={() => setShowReset(!showReset)}
              sx={{ textAlign: "left", mt: -1 }}
            >
              {showReset ? "Fermer la réinitialisation" : "Mot de passe oublié ?"}
            </MuiLink>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ borderRadius: "30px", fontWeight: "bold" }}
            >
              Se connecter
            </Button>
          </Stack>
        </form>

        {showReset && (
          <Box mt={4}>
            <Typography variant="body2" mb={1} color="text.secondary">
              Entrez votre adresse email pour réinitialiser votre mot de passe :
            </Typography>
            <Stack spacing={2}>
              <TextField
                type="email"
                fullWidth
                placeholder="exemple@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={handleResetPassword}
                sx={{ borderRadius: "30px" }}
              >
                Envoyer l'email de réinitialisation
              </Button>
            </Stack>
          </Box>
        )}

        {resetMessage && (
          <Alert severity={resetMessage.type} sx={{ mt: 3 }}>
            {resetMessage.text}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
