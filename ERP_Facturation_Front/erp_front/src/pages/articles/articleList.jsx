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
  DialogActions,
  Dialog,
  DialogContent,
  TextField,
  DialogTitle
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Layout from "../../components/layout";
import SearchBar from "../../components/searchbar";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SwapVertIcon from "@mui/icons-material/SwapVert";

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [currentArticles, setCurrentArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const itemsPerPage = 7;
  const navigate = useNavigate();

  useEffect(() => {
    const getArticles = async () => {
      try {
        const response = await api.get("/articles/get-articles/");
        setArticles(response.data);
        setFilteredArticles(response.data);
        setTotalItems(response.data.length);
        setCurrentArticles(response.data.slice(0, itemsPerPage));
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch articles.");
        setLoading(false);
      }
    };
    getArticles();
  }, []);

  //Fonction qui gère le tri. field est le nom de la colonne
  const handleSort = (field) => {
    const newSortOrder =
      //Passe de asc à desc et invésement
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    //Cree une nouvelle copie du tableau des articles fitrés et applique le tri
    const sortedArticles = [...filteredArticles].sort((a, b) => {
      if (a[field] < b[field]) return newSortOrder === "asc" ? -1 : 1;
      if (a[field] > b[field]) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredArticles(sortedArticles);
    const startIndex = (currentPage - 1) * itemsPerPage;
    setCurrentArticles(
      sortedArticles.slice(startIndex, startIndex + itemsPerPage)
    );
  };

  //Fonction qui gère le nombre d'elements par page
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    setCurrentArticles(
      filteredArticles.slice(startIndex, startIndex + itemsPerPage)
    );
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = articles.filter(
      (item) =>
        item.article.toLowerCase().includes(term) ||
        item.categorie_nom.toLowerCase().includes(term)
    );

    setFilteredArticles(filtered);
    setTotalItems(filtered.length);

    setCurrentArticles(filtered.slice(0, itemsPerPage));
    setCurrentPage(1);
  };

  const handleMenuOpen = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleAddQuantity = async () => {
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setError("Veuillez entrer une quantité valide.");
      return;
    }

    try {
      await api.patch(`/articles/add/${selectedArticle.id}/`, {
        qty_stock: selectedArticle.qty_stock + parseInt(quantity),
      });

      // Update local state to reflect the change
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === selectedArticle.id
            ? { ...article, qty_stock: article.qty_stock + parseInt(quantity) }
            : article
        )
      );

      setFilteredArticles((prevFiltered) =>
        prevFiltered.map((article) =>
          article.id === selectedArticle.id
            ? { ...article, qty_stock: article.qty_stock + parseInt(quantity) }
            : article
        )
      );

      setCurrentArticles((prevCurrent) =>
        prevCurrent.map((article) =>
          article.id === selectedArticle.id
            ? { ...article, qty_stock: article.qty_stock + parseInt(quantity) }
            : article
        )
      );

      handleDialogClose();
    } catch (err) {
      setError("Échec de l'ajout de la quantité.");
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setQuantity(""); // Reset quantity input
  };

  return (
    <Layout>
      <Container maxWidth={false} sx={{ padding: "20px" }}>
        {loading ? (
          <Typography>Loading...</Typography>
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
                placeholder="Recherche des articles"
              />
              <Button
                component={Link}
                to="/articles/nouveau"
                variant="contained"
                sx={{ marginBottom: 2 }}
              >
                <AddCircleOutlineIcon />
              </Button>
            </Box>
            <Typography>{error}</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Button onClick={() => handleSort("article")} sx={{padding: 0}}>
                        Article <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("qty_paquet")} sx={{padding: 0}}>
                        Quantité dans le paquet <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("categorie_nom")} sx={{padding: 0}}>
                        Catégorie <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("qty_stock")} sx={{padding: 0}}>
                        Quantité en stock <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("qty_min")} sx={{padding: 0}}>
                        Stock minimum <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell size="small">{article.article}</TableCell>
                      <TableCell size="small">
                        {article.qty_paquet || "N/A"}
                      </TableCell>
                      <TableCell size="small">
                        {article.categorie_nom}
                      </TableCell>
                      <TableCell size="small">{article.qty_stock}</TableCell>
                      <TableCell size="small">{article.qty_min}</TableCell>
                      <TableCell size="small">
                        <IconButton onClick={(event) => handleMenuOpen(event, article)}>
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
                          <MenuItem onClick={handleDialogOpen}>
                            Ajouter des articles
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
                {currentArticles.length} sur {totalItems} articles
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
      {/* Dialog Box for Quantity Input */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Ajouter une quantité</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quantité"
            type="number"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleAddQuantity} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ArticleList;
