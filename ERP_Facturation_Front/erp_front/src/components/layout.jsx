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
import HomeIcon from "@mui/icons-material/Home";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";

const Layout = ({ children }) => {
  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
  };

  return (
    <Box>
      <AppBar
        position="relative"
        sx={{
          backgroundImage: "url(/images/appbar.jpg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 10
        }}
      >
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
            boxShadow: "5px 0px 10px rgba(0, 0, 0, 0.3)",
            zIndex: 5
          }}
        >
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
                backgroundColor: "#5ea5e5",
              },
              "&.active": {
                backgroundColor: "#1976d2",
              },
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
                backgroundColor: "#5ea5e5",
              },
              "&.active": {
                backgroundColor: "#1976d2",
              },
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
                backgroundColor: "#5ea5e5",
              },
              "&.active": {
                backgroundColor: "#1976d2",
              },
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
                backgroundColor: "#5ea5e5",
              },
              "&.active": {
                backgroundColor: "#1976d2",
              },
            }}
          >
            <ReceiptIcon sx={{ marginRight: 1, marginLeft: 2 }} />
            <Typography variant="body1" sx={{ color: "inherit" }}>
              Factures
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, padding: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
