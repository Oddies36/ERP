import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //Cherche la liste des clients
  useEffect(() => {
    const getClients = async () => {
      try {
        const response = await api.get("/clients/");
        setClients(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch clients.");
        setLoading(false);
      }
    };
    getClients();
  }, []);

  // Handle delete client
  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}/`); // Adjust the endpoint as needed
      setClients((prevClients) => prevClients.filter((client) => client.id !== id));
    } catch (err) {
      setError("Failed to delete the client.");
    }
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
  };

  // Handle navigation to modify client page
  const handleModify = (id) => {
    navigate(`/clients/${id}/edit`);
  };

  // Handle navigation to add client page
  const handleAddClient = () => {
    navigate("/clients/new");
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

        <Container>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box sx={{
            marginTop: 5,
            justifyContent: "space-between"
          }}>
            <Button
            component={Link}
            to="/clients/nouveau"
            variant="contained"
            sx={{
              marginBottom: 1,
            }}
            >
              <PersonAddIcon/>
              </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prénom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.nom}</TableCell>
                      <TableCell>{client.prenom}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.telephone}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleModify(client.id)}
                          sx={{ mr: 1 }}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(client.id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
      </Box>
    </Box>
  );
};

export default ClientList;