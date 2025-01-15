import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
} from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import Layout from "../../components/layout";

const Homepage = () => {
  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
  };

  return (
    <Layout>
      {/* Main Area */}
      <Box sx={{ flex: 1, padding: 4}}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Bienvenue sur votre ERP Facturation
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
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
                <Button component={Link} to="/client-list" variant="contained">
                  Gestion des clients
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
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

            <Grid item xs={12} sm={6} md={4}>
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
    </Layout>
  );
};

export default Homepage;
