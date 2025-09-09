import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const toggle = () => setOpen((o) => !o);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/exercices", label: "Exercices", protected: true },
    { to: "/historique", label: "Historique", protected: true },
    ...(role === "admin" ? [{ to: "/admin", label: "Admin", protected: true }] : []),
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/connexion");
    } catch {}
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            CESIZen
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
            {links.map((l) =>
              l.protected && !user ? null : (
                <Button key={l.to} color="inherit" component={RouterLink} to={l.to}>
                  {l.label}
                </Button>
              )
            )}
            {!user ? (
              <>
                <Button color="inherit" component={RouterLink} to="/connexion">Connexion</Button>
                <Button color="inherit" component={RouterLink} to="/inscription">Inscription</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/profil">Profil</Button>
                <Button color="inherit" onClick={handleLogout}>Déconnexion</Button>
              </>
            )}
          </Box>

          <IconButton
            color="inherit"
            edge="end"
            onClick={toggle}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={toggle}>
        <Box sx={{ width: 270 }} role="presentation" onClick={toggle}>
          <List>
            {links.map((l) =>
              l.protected && !user ? null : (
                <ListItemButton key={l.to} component={RouterLink} to={l.to}>
                  <ListItemText primary={l.label} />
                </ListItemButton>
              )
            )}
          </List>
          <Divider />
          <List>
            {!user ? (
              <>
                <ListItemButton component={RouterLink} to="/connexion">
                  <ListItemText primary="Connexion" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/inscription">
                  <ListItemText primary="Inscription" />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton component={RouterLink} to="/profil">
                  <ListItemText primary="Profil" />
                </ListItemButton>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Déconnexion" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
