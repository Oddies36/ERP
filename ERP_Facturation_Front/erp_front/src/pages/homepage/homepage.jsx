import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  Grid,
} from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';

const Homepage = () => {
  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
  };

  return (
    <Box>
      {/* Top Bar */}
      <AppBar position="static"
      sx={{
        backgroundImage: "url(/images/appbar.jpg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
  }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERP Facturation
          </Typography>
          <Button color="inherit" onClick={() => handleNavigation("/logout")}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box display="flex" sx={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: "250px",
            backgroundColor: "#1722C9",
            color: "#fff",
            
          }}
        >
          <Box>
            
            <Box
              component={NavLink}
              to="/home"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                marginTop: 5,
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <HomeIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Page d'accueil
              </Typography>
            </Box>
            <Box
              component={NavLink}
              to="/clients"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <PersonSearchIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Clients
              </Typography>
            </Box>
            <Box
              component={NavLink}
              to="/"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <InventoryIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Articles
              </Typography>
            </Box>
            <Box
              component={NavLink}
              to="/"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <ReceiptIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Factures
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Area */}
        <Box sx={{ flex: 1, padding: 4, backgroundColor: "#f4f6f8" }}>
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
                  <Button
                    component={Link}
                    to="/client-list"
                    variant="contained"
                  >
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
      </Box>
    </Box>
  );
};

export default Homepage;