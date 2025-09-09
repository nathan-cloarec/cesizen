import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import { auth } from "../firebase";
import { sendPasswordResetEmail, deleteUser, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Profil = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Un email de réinitialisation a été envoyé à votre adresse.");
    } catch (error) {
      console.error("Erreur envoi mail de réinit :", error);
      alert("Une erreur s’est produite.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/connexion");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;

    try {
      await deleteUser(user);
      alert("Compte supprimé.");
      navigate("/connexion");
    } catch (error) {
      console.error("Erreur suppression :", error);
      alert("Erreur : il faut se reconnecter récemment pour supprimer le compte.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper sx={{ p: 4, maxWidth: 500, width: "100%" }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Mon profil
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Email :</strong> {user?.email}
        </Typography>

        <Stack spacing={2}>
          <Button variant="contained" onClick={handleResetPassword}>
            Réinitialiser le mot de passe
          </Button>

          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Se déconnecter
          </Button>

          <Button variant="outlined" color="error" onClick={handleDeleteAccount}>
            Supprimer mon compte
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Profil;
