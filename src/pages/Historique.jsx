import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Box, Typography, Card, CardContent, Stack, CircularProgress } from "@mui/material";

export default function Historique() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const user = auth.currentUser;
      if (!user) { setLogs([]); setLoading(false); return; }

      try {
        const q = query(
          collection(db, "exercicesLogs"),
          where("uid", "==", user.uid)
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        rows.sort((a, b) => {
          const ta = a.completedAt?.toMillis?.() ?? 0;
          const tb = b.completedAt?.toMillis?.() ?? 0;
          return tb - ta;
        });

        setLogs(rows);
      } catch (e) {
        console.error("Erreur lecture historique:", e);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <Box p={2} display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} /> <Typography>Chargement…</Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>Historique des exercices réalisés</Typography>
      <Stack spacing={2}>
        {logs.map(log => (
          <Card key={log.id}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                {log.nom ?? "Exercice"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {log.inspiration}-{log.apnee}-{log.expiration} s • {log.type ?? "—"}
              </Typography>
              <Typography variant="body2">
                Fini le : {log.completedAt?.toDate?.().toLocaleString?.() ?? "—"}
              </Typography>
            </CardContent>
          </Card>
        ))}

        {logs.length === 0 && (
          <Typography>Aucun exercice réalisé pour l’instant.</Typography>
        )}
      </Stack>
    </Box>
  );
}
