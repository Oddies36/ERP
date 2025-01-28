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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/articles/${id}/`);
      const updatedArticles = articles.filter((article) => article.id !== id);
      setArticles(updatedArticles);

      const updatedFilteredArticles = filteredArticles.filter(
        (article) => article.id !== id
      );
      setFilteredArticles(updatedFilteredArticles);
      setTotalItems(updatedFilteredArticles.length);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setCurrentArticles(updatedFilteredArticles.slice(startIndex, endIndex));
    } catch (err) {
      setError("Failed to delete the article.");
    }
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    const sortedArticles = [...filteredArticles].sort((a, b) => {
      if (a[field] < b[field]) return newSortOrder === "asc" ? -1 : 1;
      if (a[field] > b[field]) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredArticles(sortedArticles);
    const startIndex = (currentPage - 1) * itemsPerPage;
    setCurrentArticles(sortedArticles.slice(startIndex, startIndex + itemsPerPage));
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    setCurrentArticles(filteredArticles.slice(startIndex, startIndex + itemsPerPage));
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

  return (
    <Layout>
      <Container>
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Button onClick={() => handleSort("article")}>
                        Article <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("qty_paquet")}>
                        Quantité dans le paquet <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("categorie_nom")}>
                        Catégorie <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("qty_stock")}>
                        Quantité en stock <SwapVertIcon />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSort("qty_min")}>
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
                      <TableCell size="small">{article.qty_paquet || "N/A"}</TableCell>
                      <TableCell size="small">{article.categorie_nom}</TableCell>
                      <TableCell size="small">{article.qty_stock}</TableCell>
                      <TableCell size="small">{article.qty_min}</TableCell>
                      <TableCell size="small">
                        <IconButton>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu>
                          <MenuItem>Edit</MenuItem>
                          <MenuItem>Delete</MenuItem>
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
    </Layout>
  );
};

export default ArticleList;
