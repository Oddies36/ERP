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
  Pagination,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Layout from "../../components/layout";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import SearchBar from "../../components/searchbar";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [currentClients, setCurrentClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const itemsPerPage = 7;
  const navigate = useNavigate();

  useEffect(() => {
    const getClients = async () => {
      try {
        const response = await api.get("/clients/get-clients/");
        setClients(response.data);
        setFilteredClients(response.data);
        setTotalItems(response.data.length);
        setLoading(false);
        setCurrentClients(response.data.slice(0, itemsPerPage));
      } catch (err) {
        setError("Erreur lors de la récuperation du client.");
        setLoading(false);
      }
    };
    getClients();
  }, []);


  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  
    const sortedClients = [...filteredClients].sort((a, b) => {
      let valueA = a[field] ?? "";
      let valueB = b[field] ?? "";
  
      if (field === "tva_entreprise") {
        valueA = parseInt(valueA.replace(/\D/g, ""), 10) || 0;
        valueB = parseInt(valueB.replace(/\D/g, ""), 10) || 0;
      }
  
      if (valueA < valueB) return newSortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
    setFilteredClients(sortedClients);
    setCurrentClients(sortedClients.slice(0, itemsPerPage));
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentClients(filteredClients.slice(startIndex, endIndex));
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
  
    const filtered = clients.filter((client) =>
      [
        client.nom,
        client.prenom,
        client.email,
        client.telephone,
        client.tva_entreprise,
      ]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(term))
    );
  
    setFilteredClients(filtered);
    setTotalItems(filtered.length);
    setCurrentClients(filtered.slice(0, itemsPerPage));
    setCurrentPage(1);
  };

  const handleMenuOpen = (event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleModify = (id) => {
    navigate(`/clients/${id}/edit`);
  };

  return (
    <Layout>
      <Container maxWidth={false} sx={{ padding: "20px" }}>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : (
          <Box sx={{ marginTop: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <SearchBar
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Recherche des clients"
              />
              <Button
                component={Link}
                to="/clients/nouveau"
                variant="contained"
                sx={{ marginBottom: 2 }}
              >
                <PersonAddIcon />
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Button onClick={() => handleSort("nom")} sx={{padding: 0}}>
                        Nom <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("prenom")} sx={{padding: 0}}>
                        Prénom <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("email")} sx={{padding: 0}}>
                        Email <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("tva_entreprise")} sx={{padding: 0}}>
                        Numéro TVA <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("telephone")} sx={{padding: 0}}>
                        Téléphone <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell size="small">{client.nom}</TableCell>
                      <TableCell size="small">{client.prenom}</TableCell>
                      <TableCell size="small">{client.email}</TableCell>
                      <TableCell size="small">{client.tva_entreprise}</TableCell>
                      <TableCell size="small">{client.telephone}</TableCell>
                      <TableCell size="small">
                        <IconButton
                          onClick={(event) => handleMenuOpen(event, client)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                          slotProps={{
                            paper: {
                              elevation: 2,
                            },
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              handleModify(selectedClient.id);
                              handleMenuClose();
                            }}
                          >
                            Modification
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 2,
              }}
            >
              <Typography>
                Nombre d'entrées {currentClients.length} sur {totalItems}
              </Typography>
              <Pagination
                count={Math.ceil(totalItems / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default ClientList;
