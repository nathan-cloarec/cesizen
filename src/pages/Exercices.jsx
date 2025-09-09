import React, { useState, useEffect, useRef } from "react";
import { serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  TextField,
  Grid,
  Divider,
} from "@mui/material";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const PHASES = ["inspiration", "apnee", "expiration"];
const couleursPhases = {
  inspiration: "#bbdefb",
  apnee: "#e1bee7",
  expiration: "#c8e6c9",
};

const PRESETS = [
  { nom: "Exercice 7-4-8", cfg: { inspiration: 7, apnee: 4, expiration: 8 } },
  { nom: "Exercice 5-0-5", cfg: { inspiration: 5, apnee: 0, expiration: 5 } },
  { nom: "Exercice 4-0-6", cfg: { inspiration: 4, apnee: 0, expiration: 6 } },
];

const chargerExosPersoLocal = () => {
  const data = localStorage.getItem("exercicesPerso");
  return data ? JSON.parse(data) : [];
};

export default function ExerciceRespiration() {
  const [exercicesPerso, setExercicesPerso] = useState([]);
  const [user, setUser] = useState(null);

  const [configEnCours, setConfigEnCours] = useState(null);
  const [nomExerciceEnCours, setNomExerciceEnCours] = useState("");
  const [phase, setPhase] = useState("inspiration");
  const [secondes, setSecondes] = useState(0);
  const [enCours, setEnCours] = useState(false);

  const [inspi, setInspi] = useState(5);
  const [apnee, setApnee] = useState(0);
  const [expi, setExpi] = useState(5);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  const logExerciceTermine = async () => {
    if (!configEnCours) return;
    if (!user) {
      const logsLocaux = JSON.parse(localStorage.getItem("historiqueExos") || "[]");
      logsLocaux.push({
        ...configEnCours,
        nom: nomExerciceEnCours,
        completedAt: new Date().toISOString(),
      });
      localStorage.setItem("historiqueExos", JSON.stringify(logsLocaux));
      return;
    }
    try {
      await addDoc(collection(db, "exercicesLogs"), {
        uid: user.uid,
        ...configEnCours,
        nom: nomExerciceEnCours,
        completedAt: serverTimestamp(),
        durationSec:
          configEnCours.inspiration +
          configEnCours.apnee +
          configEnCours.expiration,
        type: exercicesPerso.some(
          (e) =>
            e.inspiration === configEnCours.inspiration &&
            e.apnee === configEnCours.apnee &&
            e.expiration === configEnCours.expiration
        )
          ? "perso"
          : "predefini",
      });
      console.log("✅ Exercice terminé enregistré");
    } catch (err) {
      console.error("❌ Erreur log exercice:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u?.uid) {
        try {
          const q = query(collection(db, "exercicesPerso"), where("uid", "==", u.uid));
          const snap = await getDocs(q);
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setExercicesPerso(data);
        } catch (err) {
          console.error("Erreur Firestore :", err);
        }
      } else {
        setExercicesPerso(chargerExosPersoLocal());
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (enCours && configEnCours) lancerPhase("inspiration");
    return () => clearInterval(timerRef.current);
  }, [enCours, configEnCours]);

  const lancerPhase = (nomPhase) => {
    const duree = configEnCours[nomPhase];
    if (duree === 0) {
      passerPhaseSuivante(nomPhase);
      return;
    }
    setPhase(nomPhase);
    setSecondes(duree);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondes((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          passerPhaseSuivante(nomPhase);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const passerPhaseSuivante = (actuelle) => {
    let i = PHASES.indexOf(actuelle);
    let suivante = (i + 1) % PHASES.length;
    while (PHASES[suivante] === "apnee" && configEnCours.apnee === 0) {
      suivante = (suivante + 1) % PHASES.length;
    }
    lancerPhase(PHASES[suivante]);
  };

  const quitter = () => {
    logExerciceTermine();
    clearInterval(timerRef.current);
    setConfigEnCours(null);
    setNomExerciceEnCours("");
    setPhase("inspiration");
    setSecondes(0);
    setEnCours(false);
  };

  const enregistrer = async () => {
    const nouvelExo = { inspiration: inspi, apnee: apnee, expiration: expi };

    const existe = exercicesPerso.some(
      (exo) =>
        exo.inspiration === inspi &&
        exo.apnee === apnee &&
        exo.expiration === expi
    );
    if (existe) return;

    if (user) {
      try {
        const docRef = await addDoc(collection(db, "exercicesPerso"), {
          ...nouvelExo,
          uid: user.uid,
        });
        setExercicesPerso((prev) => [
          ...prev,
          { id: docRef.id, ...nouvelExo, uid: user.uid },
        ]);
      } catch (err) {
        console.error("Erreur Firestore :", err);
        alert("Enregistrement impossible, voir console.");
      }
    } else {
      const maj = [...exercicesPerso, nouvelExo];
      setExercicesPerso(maj);
      localStorage.setItem("exercicesPerso", JSON.stringify(maj));
    }
  };

  const supprimer = async (exo) => {
    if (user && exo.id) {
      try {
        await deleteDoc(doc(db, "exercicesPerso", exo.id));
        setExercicesPerso((prev) => prev.filter((e) => e.id !== exo.id));
      } catch (err) {
        console.error("Erreur suppression Firestore :", err);
        alert("Suppression impossible, voir console.");
      }
    } else {
      const maj = exercicesPerso.filter(
        (e) =>
          !(
            e.inspiration === exo.inspiration &&
            e.apnee === exo.apnee &&
            e.expiration === exo.expiration
          )
      );
      setExercicesPerso(maj);
      localStorage.setItem("exercicesPerso", JSON.stringify(maj));
    }
  };

  const start = (cfg, nom) => {
    setConfigEnCours(cfg);
    setNomExerciceEnCours(nom);
    setEnCours(true);
  };

  if (configEnCours) {
    const idx = PHASES.indexOf(phase);
    const next = PHASES[(idx + 1) % PHASES.length];
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
        <Card sx={{ bgcolor: couleursPhases[phase] }}>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1565C0" }}>
                {nomExerciceEnCours}
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center">
                {PHASES.map((p) => (
                  <Box
                    key={p}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      opacity: p === phase ? 1 : 0.35,
                      bgcolor: p === "inspiration" ? "#64b5f6" : p === "apnee" ? "#ba68c8" : "#81c784",
                      border: "1px solid rgba(0,0,0,.12)",
                    }}
                    title={p}
                  />
                ))}
              </Stack>

              <Typography variant="h3" sx={{ lineHeight: 1, fontSize: { xs: 42, md: 56 } }}>
                {secondes} s
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Prochaine phase : <strong>{next}</strong>
              </Typography>

              <Divider sx={{ width: "100%" }} />

              <Button variant="outlined" color="error" onClick={quitter} fullWidth>
                Terminer l’exercice
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 1.5, fontSize: { xs: 24, md: 32 }, fontWeight: 700 }}>
        Exercices de respiration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choisis un préréglage ou configure le tien. (L’apnée à 0 est automatiquement sautée.)
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Préréglages
            </Typography>
            <Button variant="text" onClick={() => navigate("/historique")}>
              Voir l’historique
            </Button>
          </Stack>

          <Grid container spacing={1.2}>
            {PRESETS.map(({ nom, cfg }) => (
              <Grid key={nom} item xs={12} sm={6}>
                <Button variant="contained" onClick={() => start(cfg, nom)} fullWidth>
                  {nom}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
            Créer mon exercice
          </Typography>

          <Grid container spacing={1.2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Inspiration (s)"
                type="number"
                value={inspi}
                onChange={(e) => setInspi(Number(e.target.value))}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Apnée (s)"
                type="number"
                value={apnee}
                onChange={(e) => setApnee(Number(e.target.value))}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Expiration (s)"
                type="number"
                value={expi}
                onChange={(e) => setExpi(Number(e.target.value))}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => {
                const nom = `Exercice ${inspi}-${apnee}-${expi}`;
                start({ inspiration: inspi, apnee: apnee, expiration: expi }, nom);
              }}
              fullWidth
            >
              Lancer
            </Button>

            {user && (
              <Button variant="outlined" onClick={enregistrer} fullWidth>
                Enregistrer
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
            Mes exercices enregistrés
          </Typography>

          {exercicesPerso.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun exercice enregistré pour l’instant.
            </Typography>
          ) : (
            <Grid container spacing={1.2}>
              {exercicesPerso.map((exo) => {
                const nom = `Exercice ${exo.inspiration}-${exo.apnee}-${exo.expiration}`;
                return (
                  <Grid key={exo.id ?? nom} item xs={12} sm={6}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ width: "100%" }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => start(exo, nom)}
                        sx={{
                          width: { xs: "100%", sm: "auto" },
                          flex: 1,
                        }}
                      >
                        {nom}
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => supprimer(exo)}
                        sx={{
                          width: { xs: "100%", sm: "auto" },
                          whiteSpace: "nowrap",
                          px: 1.5,
                          flexShrink: 0,
                        }}
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>

          )}
        </CardContent>
      </Card>
    </Container>
  );
}
