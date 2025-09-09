import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const APropos = () => {
  const [texte, setTexte] = useState("");

  useEffect(() => {
    const fetchTexte = async () => {
      const snap = await getDoc(doc(db, "informations", "aPropos"));
      if (snap.exists()) {
        setTexte(snap.data().texte);
      } else {
        setTexte("Contenu indisponible.");
      }
    };
    fetchTexte();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#E3F2FD",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        p: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 800,
          width: "100%",
          p: 4,
          borderRadius: 4,
          bgcolor: "#ffffffee",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ color: "#1976D2", fontWeight: "bold" }}
        >
          À propos de CESIZen
        </Typography>

        <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem" }}>
          {texte}
        </Typography>
      </Paper>
    </Box>
  );
};

export default APropos;
