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

const Homepage = () => {
  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
    // Add navigation logic here (e.g., using React Router)
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar - Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERP System
          </Typography>
          <Button color="inherit" onClick={() => handleNavigation("/logout")}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Section */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the ERP Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Manage your clients, articles, and invoices efficiently.
        </Typography>

        {/* Actions */}
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
                Add new clients or manage existing ones.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigation("/clients")}
              >
                Manage Clients
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
                Add, edit, or remove articles.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigation("/articles")}
              >
                Manage Articles
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
                Invoices
              </Typography>
              <Typography variant="body2" gutterBottom>
                Generate new invoices or view past invoices.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigation("/invoices")}
              >
                Manage Invoices
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          py: 2,
          textAlign: "center",
          backgroundColor: "#1976d2",
          color: "white",
          mt: 4,
        }}
      >
        <Typography variant="body2">
          © 2024 ERP System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Homepage;
