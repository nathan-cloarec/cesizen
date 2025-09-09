import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function Inscription() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInscription = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("Veuillez créer un mot de passe d'au moins 6 caractères");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "utilisateurs", user.uid), {
        email: user.email,
        role: "utilisateur",
        actif: true,
      });

      navigate("/");
    } catch (err) {
      console.error("Erreur d'inscription :", err.message);
      setError(err.message);
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
          Créer un compte CESIZen
        </Typography>

        <form onSubmit={handleInscription}>
          <Stack spacing={3}>
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
              helperText="Minimum 6 caractères"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ borderRadius: "30px", fontWeight: "bold" }}
            >
              S’inscrire
            </Button>
          </Stack>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
