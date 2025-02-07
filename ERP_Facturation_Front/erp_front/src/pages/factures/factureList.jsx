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
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Layout from "../../components/layout";
import SearchBar from "../../components/searchbar";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SwapVertIcon from "@mui/icons-material/SwapVert";

const FactureList = () => {
  const [factures, setFactures] = useState([]);
  const [currentFactures, setCurrentFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const itemsPerPage = 7;
  const navigate = useNavigate();

  useEffect(() => {
    const getFactures = async () => {
      try {
        const response = await api.get("/factures/get-factures/");
        setFactures(response.data);
        setFilteredFactures(response.data);
        setTotalItems(response.data.length);
        setCurrentFactures(response.data.slice(0, itemsPerPage));

        setLoading(false);
      } catch (err) {
        setError("Erreur pendant la récupération des factures.");
        setLoading(false);
      }
    };
    getFactures();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/factures/${id}/`);
      const updatedFactures = factures.filter((facture) => facture.id !== id);
      setFactures(updatedFactures);

      const updatedFilteredFactures = filteredFactures.filter(
        (facture) => facture.id !== id
      );
      setFilteredFactures(updatedFilteredFactures);
      setTotalItems(updatedFilteredFactures.length);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setCurrentFactures(updatedFilteredFactures.slice(startIndex, endIndex));
    } catch (err) {
      setError("Erreur pendant la suppression de la facture.");
    }
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  
    const sortedFactures = [...filteredFactures].sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
  
      if (field === "date_creation") {
        valueA = new Date(a[field]);
        valueB = new Date(b[field]);
      }

      if (field === "num_client") {
        valueA = a.client.id;
        valueB = b.client.id;
      }

      if (field === "client_nom") {
        valueA = a.client ? `${a.client.prenom} ${a.client.nom}`.toLowerCase() : "";
        valueB = b.client ? `${b.client.prenom} ${b.client.nom}`.toLowerCase() : "";
      }
  
      if (valueA < valueB) return newSortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
    setFilteredFactures(sortedFactures);
    const startIndex = (currentPage - 1) * itemsPerPage;
    setCurrentFactures(sortedFactures.slice(startIndex, startIndex + itemsPerPage));
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    setCurrentFactures(filteredFactures.slice(startIndex, startIndex + itemsPerPage));
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
  
    const filtered = factures.filter((facture) => {
      const numeroFacture = facture.numero_facture
        ? facture.numero_facture.toLowerCase()
        : "";
      const clientNom = facture.client.nom
        ? facture.client.nom.toLowerCase()
        : "";
      const clientPrenom = facture.client.prenom
      ? facture.client.prenom.toLowerCase()
      : "";
      const dateCreation = facture.date_creation
        ? facture.date_creation.toLowerCase()
        : "";
        const statut = facture.statut
        ? facture.statut.toLowerCase()
        : "";
      const numeroClient = facture.client.id
      ? String(facture.client.id)
      : "";

      const fullName = `${clientNom} ${clientPrenom}`;
      const fullNameReverse = `${clientPrenom} ${clientNom}`;
  
      return (
        numeroFacture.includes(term) ||
        clientNom.includes(term) ||
        clientPrenom.includes(term) ||
        dateCreation.includes(term) ||
        fullName.includes(term) ||
        fullNameReverse.includes(term) ||
        numeroClient.includes(term) ||
        statut.includes(term)
      );
    });
  
    setFilteredFactures(filtered);
    setTotalItems(filtered.length);
  
    setCurrentFactures(filtered.slice(0, itemsPerPage));
    setCurrentPage(1);
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
                marginBottom: 2,
              }}
            >
              <SearchBar
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Rechercher des factures"
              />
              <Button
                component={Link}
                to="/factures/nouveau"
                variant="contained"
                sx={{ marginBottom: 2 }}
              >
                <AddCircleOutlineIcon />
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Button onClick={() => handleSort("numero_facture")} sx={{padding: 0}}>
                        Numéro de facture <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("client_nom")} sx={{padding: 0}}>
                        Client <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("num_client")} sx={{padding: 0}}>
                        Numéro client <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("date_creation")} sx={{padding: 0}}>
                        Date de création <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("prix_htva")} sx={{padding: 0}}>
                        Prix HTVA <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("prix_ttc")} sx={{padding: 0}}>
                        Prix TTC <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("statut")} sx={{padding: 0}}>
                        Statut <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentFactures.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell size="small">
                        <Link to={`/factures/${facture.numero_facture}/${facture.client.id}`}>{facture.numero_facture}</Link>
                      </TableCell>
                      <TableCell size="small">{facture.client.nom} {facture.client.prenom}</TableCell>
                      <TableCell size="small">{facture.client.id}</TableCell>
                      <TableCell size="small">{facture.date_creation}</TableCell>
                      <TableCell size="small">{facture.prix_htva}€</TableCell>
                      <TableCell size="small">{facture.prix_ttc}€</TableCell>
                      <TableCell size="small">{facture.statut}</TableCell>
                      <TableCell size="small">
                        <IconButton>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu>
                          <MenuItem>Edit</MenuItem>
                          <MenuItem onClick={() => handleDelete(facture.id)}>Delete</MenuItem>
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
                {currentFactures.length} sur {totalItems} factures
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

export default FactureList;
