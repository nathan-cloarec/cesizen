import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from "@mui/material";
import { Link } from "react-router-dom";

const Accueil = () => {
  const infos = [
    {
      title: "Santé mentale",
      description: "Comprendre son équilibre intérieur et détecter les signes de mal-être.",
      link: "/sante-mentale"
    },
    {
      title: "Gestion du stresss",
      description: "Apprendre à réguler ses émotions et réduire les tensions au quotidien.",
      link: "/gestion-stress"
    },
    {
      title: "À propos du site",
      description: "Découvrez les objectifs de l’application CESIZen et son fonctionnement.",
      link: "/a-propos"
    }
  ];

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#E3F2FD",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <Typography variant="h3" align="center" gutterBottom sx={{ color: "#1976D2" }}>
        Bienvenue sur CESIZen
      </Typography>

      <Typography variant="h6" align="center" color="text.secondary" mb={5} maxWidth="700px">
        Prenez soin de votre esprit aussi bien que de votre corps. Explorez des ressources pensées pour vous guider vers le calme et l’équilibre intérieur.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {infos.map((info, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                boxShadow: 5,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {info.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {info.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ mt: "auto", justifyContent: "center", pb: 2 }}>
                <Button
                  component={Link}
                  to={info.link}
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: "30px", px: 4 }}
                >
                  En savoir plus
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Accueil;
