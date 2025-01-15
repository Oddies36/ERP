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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Layout from "../../components/layout";

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
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== id)
      );
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
    <Layout>
      <Container>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box
            sx={{
              marginTop: 5,
              justifyContent: "space-between",
            }}
          >
            <Button
              component={Link}
              to="/clients/nouveau"
              variant="contained"
              sx={{
                marginBottom: 1,
              }}
            >
              <PersonAddIcon />
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
    </Layout>
  );
};

export default ClientList;
