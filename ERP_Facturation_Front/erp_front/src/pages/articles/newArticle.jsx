import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Grid from "@mui/material/Grid2";
import Layout from "../../components/layout";

const NewArticle = () => {
  const navigate = useNavigate();

  const [articleData, setArticleData] = useState({
    categorie: "",
    article: "",
    ean: "",
    prix_htva: "",
    description: "",
    prix_achat: "",
    qty_min: "",
    qty_oos: "",
    qty_order: "",
    qty_stock: "",
    unit: "",
    pourcentage_alc: "",
    volume: "",
    prix_consigne: "",
    qty_paquet: "",
    poids: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const getCategory = async () => {
      try {
        const response = await api.get("/articles/get-category/");
        console.log(response.data);
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError("Impossible de lire les catégories");
        setLoading(false);
      }
    };

    getCategory();
  }, []);

  useEffect(() => {}, [categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticleData({
      ...articleData,
      [name]: value,
      ...(name === "qty_order" && { qty_stock: value }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/articles/add-article/", articleData);
      console.log("Article ajouté:", response.data);
      navigate("/articles");
    } catch (error) {
      console.error("Erreur lors de la création de l'article:", error);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ajouter un nouvel article
          </Typography>
          {error && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={1}>
              {/* Categorie */}
              <Grid size={6}>
                <TextField
                  select
                  fullWidth
                  label="Catégorie"
                  name="categorie"
                  value={articleData.categorie || ""}
                  onChange={handleChange}
                  required
                >
                  {categories.map((categorie) => (
                    <MenuItem key={categorie.id} value={categorie.id}>
                      {categorie.categorie}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Nom Article */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Nom de l'article"
                  name="article"
                  value={articleData.article}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* EAN */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="EAN"
                  name="ean"
                  value={articleData.ean}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* HTVA */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Prix HTVA (€)"
                  name="prix_htva"
                  type="text"
                  value={articleData.prix_htva}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Prix d'achat */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Prix d'achat (€)"
                  name="prix_achat"
                  type="text"
                  value={articleData.prix_achat}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Prix consigne */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Prix de la consigne (€)"
                  name="prix_consigne"
                  type="text"
                  value={articleData.prix_consigne}
                  onChange={handleChange}
                />
              </Grid>

              {/* Quantité */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Quantité minimale"
                  name="qty_min"
                  type="number"
                  value={articleData.qty_min}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Quantité en rupture"
                  name="qty_oos"
                  type="number"
                  value={articleData.qty_oos}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Quantité commandée"
                  name="qty_order"
                  type="number"
                  value={articleData.qty_order}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Unité"
                  name="unit"
                  value={articleData.unit}
                  onChange={handleChange}
                />
              </Grid>

              {/* Pourcentage alc et volume */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Pourcentage d'alcool (%)"
                  name="pourcentage_alc"
                  type="number"
                  value={articleData.pourcentage_alc}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Volume (litres)"
                  name="volume"
                  type="number"
                  value={articleData.volume}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Quantité dans le paquet"
                  name="qty_paquet"
                  type="number"
                  value={articleData.qty_paquet}
                  onChange={handleChange}
                />
              </Grid>

              {/* Poids */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Poids (kg)"
                  name="poids"
                  type="number"
                  value={articleData.poids}
                  onChange={handleChange}
                />
              </Grid>

              {/* Bouton ajouter */}
              <Grid size={6}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Ajouter l'article
                </Button>
              </Grid>
              {/* Description */}
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={articleData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </Layout>
  );
};

export default NewArticle;
