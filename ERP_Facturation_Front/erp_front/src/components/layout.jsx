import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navigationItems = [
    { text: "Page d'accueil", icon: <HomeIcon />, to: "/home" },
    { text: "Clients", icon: <PersonSearchIcon />, to: "/clients" },
    { text: "Articles", icon: <InventoryIcon />, to: "/articles" },
    { text: "Factures", icon: <ReceiptIcon />, to: "/factures" },
  ];

  const renderNavigation = () => (
    <List>
      {navigationItems.map((item) => (
        <ListItem
          component={NavLink}
          to={item.to}
          key={item.text}
          sx={{
            "&.active": { backgroundColor: "#1976d2", color: "#fff" },
          }}
        >
          <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text}
                    sx={{color: "#fff"}}
                     />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box>
      {/* AppBar */}
      <AppBar
        position="relative"
        sx={{
          backgroundImage: "url(/images/appbar.jpg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: theme.zIndex.drawer + 1,
          width: "100%"
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERP Facturation
          </Typography>
          <Button color="inherit" onClick={() => console.log("Déconnexion")}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar or Drawer */}
      <Box sx={{ display: "flex" }}>
        {!isMobile ? (
          <Box
            sx={{
              width: "250px",
              backgroundColor: "#1722C9",
              color: "#fff",
              height: "100vh",
              boxShadow: "5px 0 10px rgba(0, 0, 0, 0.3)",
              zIndex: 10,
            }}
          >
            {renderNavigation()}
          </Box>
        ) : (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            sx={{
              "& .MuiDrawer-paper": {
                width: 250,
                backgroundColor: "#1722C9",
                color: "#fff",
                marginTop: "56px", // Pushes the drawer below the AppBar (AppBar height)

              },
            }}
          >
            {renderNavigation()}
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            padding: 4,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
