import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

const Homepage = () => {
  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERP Facturation
          </Typography>
          <Button color="inherit" onClick={() => handleNavigation("/logout")}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Page d'accueil
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid xs={12} sm={6} md={4}>
            <Box
              sx={{
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: 2,
                padding: 3,
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Clients
              </Typography>
              <Typography variant="body2" gutterBottom>
                Ajouter, modifier ou supprimer des clients
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigation("/clients")}
              >
                Gestion des clients
              </Button>
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box
              sx={{
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: 2,
                padding: 3,
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Articles
              </Typography>
              <Typography variant="body2" gutterBottom>
                Ajouter, modifier, supprimer des articles
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigation("/articles")}
              >
                Gestion des articles
              </Button>
            </Box>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Box
              sx={{
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: 2,
                padding: 3,
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Factures
              </Typography>
              <Typography variant="body2" gutterBottom>
                Visualiser ou créer des factures
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigation("/invoices")}
              >
                Gestion des factures
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Homepage;
