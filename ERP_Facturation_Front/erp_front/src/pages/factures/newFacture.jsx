import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import Layout from "../../components/layout";
import api from "../../api/axiosConfig";
import { Decimal } from "decimal.js";
import { useNavigate } from "react-router-dom";


function NewFacture() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientAddresses, setClientAddresses] = useState({
    facturation: null,
    livraison: null,
  });
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, tva: 0, total: 0 });
  const [error, setError] = useState();

  // Fetch clients for the autocomplete
  useEffect(() => {
    const getClients = async () => {
      try {
        const response = await api.get("/clients/get-clients/");
        setClients(response.data);
      } catch (err) {
        console.error("Failed to fetch clients.");
      }
    };
    getClients();
  }, []);

  // Fetch addresses for the selected client
  useEffect(() => {
    if (selectedClient) {
      const getClientAddresses = async () => {
        try {
          const response = await api.get(
            `/clients/${selectedClient.id}/addresses/`
          );
          const { facturation, livraison } = response.data;

          console.log("facturation: ", facturation);
          console.log("livraison", livraison);
          setClientAddresses({ facturation, livraison });
        } catch (err) {
          console.error("Failed to fetch client addresses.");
        }
      };
      getClientAddresses();
    } else {
      setClientAddresses({ facturation: null, livraison: null });
    }
  }, [selectedClient]);

  // Fetch articles for the autocomplete when a client is selected
  useEffect(() => {
    if (selectedClient) {
      const getArticles = async () => {
        try {
          const response = await api.get("/articles/get-articles/");
          console.log("Articles received:", response.data);
          setAllArticles(response.data);
        } catch (err) {
          console.error("Failed to fetch articles.");
        }
      };
      getArticles();
    } else {
      setAllArticles([]); // Clear articles if no client is selected
    }
  }, [selectedClient]);

  // Calculate totals dynamically
  useEffect(() => {
    // Calculate subtotal (total HTVA for all items)
    const subtotal = articles.reduce(
      (sum, article) =>
        Decimal.sum(sum, Decimal(article.quantity).times(article.prix_htva)),
      new Decimal(0)
    );

    // Calculate TVA for each item, round it, and then sum up
    const tva = articles.reduce((sum, article) => {
      const tvaForOneItem = Decimal(article.prix_htva)
        .times(article.tva)
        .div(100) // TVA for one item
        .toDecimalPlaces(2); // Round to 2 decimal places
      const totalTVAForItem = tvaForOneItem
        .times(article.quantity)
        .toDecimalPlaces(2); // Round after multiplying by quantity
      return Decimal.sum(sum, totalTVAForItem);
    }, new Decimal(0));

    // Update totals with rounded values
    setTotals({
      subtotal: subtotal.toDecimalPlaces(2).toNumber(),
      tva: tva.toDecimalPlaces(2).toNumber(),
      total: subtotal.plus(tva).toDecimalPlaces(2).toNumber(),
    });
  }, [articles]);

  const handleAddArticle = () => {
    setArticles([
      ...articles,
      {
        id: "",
        line_number: articles.length + 1,
        quantity: 0,
        qty_stock: 0,
        prix_htva: 0,
        tva: 0,
      },
    ]);
  };

  const handleRemoveArticle = (index) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const handleArticleChange = async (index, field, value) => {
    setError("");
    const updatedArticles = [...articles];

    if (field === "quantity") {
      const currentArticle = updatedArticles[index];

      // Check if quantity exceeds stock
      if (value > currentArticle.qty_stock) {
        setError("La quantité choisi dépasse le nombre en stock");
        updatedArticles[index][field] = currentArticle.qty_stock; // Cap at stock
      } else if (value < 1) {
        updatedArticles[index][field] = 0; // Minimum quantity is 1
      } else {
        updatedArticles[index][field] = value;
      }
    } else {
      updatedArticles[index][field] = value;
    }

    if (field === "id" && value) {
      try {
        // Fetch the article details directly using the selected ID
        const selectedArticle = allArticles.find((a) => a.id === value);

        if (selectedArticle) {
          updatedArticles[index] = {
            ...updatedArticles[index],
            id: selectedArticle.id,
            article: selectedArticle.article,
            prix_htva: selectedArticle.prix_htva,
            categorie: selectedArticle.categorie,
            qty_stock: selectedArticle.qty_stock,
            quantity: updatedArticles[index].quantity || 0, // Default quantity
          };

          // Fetch the TVA rate
          const pays =
            clientAddresses.facturation?.[0]?.code_postal?.ville?.pays?.pays;

          if (pays) {
            const tvaResponse = await api.get(
              `/articles/get-tva/${pays}/${selectedArticle.categorie}/${selectedClient.tva_entreprise}/`
            );

            updatedArticles[index].tva = tvaResponse.data.tva || 0;
          }
        }
      } catch (err) {
        console.error("Failed to fetch article or TVA rate:", err);
      }
    }

    // Recalculate dependent values
    const article = updatedArticles[index];
    if (article.prix_htva && article.tva !== undefined) {
      const prixAvecTva = Decimal(article.prix_htva)
        .times(1 + article.tva / 100)
        .toDecimalPlaces(2)
        .toNumber();
      const totalHtva = Decimal(article.prix_htva)
        .times(article.quantity)
        .toDecimalPlaces(2)
        .toNumber();
      const totalAvecTva = Decimal(prixAvecTva)
        .times(article.quantity)
        .toDecimalPlaces(2)
        .toNumber();

      updatedArticles[index] = {
        ...article,
        prixAvecTva,
        totalHtva,
        totalAvecTva,
      };
    }

    // Update the state
    setArticles(updatedArticles);
  };

  const handleSubmit = async () => {
    if (totals.total <= 0.0) {
      setError("Veuillez choisir un article");
    } else {
      try {
        const payload = {
          client_id: selectedClient.id,
          articles: articles.map((article) => ({
            id: parseInt(article.id, 10),
            line_number: article.line_number,
            quantity: parseInt(article.quantity, 10),
          })),
        };

        const response = await api.post("/factures/new-facture/", payload);
        console.log("Facture:", response.data);
        navigate("/factures");
      } catch (err) {
        console.error("Erreur de création de facture:", err);
      }
    }
  };

  return (
    <Layout>
      <Container maxWidth={false} sx={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Nouvelle facture
        </Typography>
        <Box display="flex" mb={4} alignItems="flex-start" gap={2}>
          <Autocomplete
            options={clients}
            getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
            onChange={(e, value) => {
              setSelectedClient(value);
              setArticles([]); // Clear articles when a new client is selected
              setTotals({ subtotal: 0, tva: 0, total: 0 }); // Optionally reset totals
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client"
                variant="outlined"
                size="small"
                sx={{ width: 300 }}
              />
            )}
          />
          {clientAddresses.facturation &&
            clientAddresses.facturation.length > 0 && (
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6">Adresse de facturation</Typography>
                  <Typography>
                    {clientAddresses.facturation[0]?.rue}{" "}
                    {clientAddresses.facturation[0]?.numero}
                  </Typography>
                  <Typography>
                    {clientAddresses.facturation[0]?.code_postal?.cp}{" "}
                    {clientAddresses.facturation[0]?.code_postal?.ville?.ville}
                  </Typography>
                  <Typography>
                    {
                      clientAddresses.facturation[0]?.code_postal?.ville?.pays
                        ?.pays
                    }
                  </Typography>
                </CardContent>
              </Card>
            )}

          {clientAddresses.livraison &&
            clientAddresses.livraison.length > 0 && (
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6">Adresse de livraison</Typography>
                  <Typography>
                    {clientAddresses.livraison[0]?.rue}{" "}
                    {clientAddresses.livraison[0]?.numero}
                  </Typography>
                  <Typography>
                    {clientAddresses.livraison[0]?.code_postal?.cp}{" "}
                    {clientAddresses.livraison[0]?.code_postal?.ville?.ville}
                  </Typography>
                  <Typography>
                    {
                      clientAddresses.livraison[0]?.code_postal?.ville?.pays
                        ?.pays
                    }
                  </Typography>
                </CardContent>
              </Card>
            )}
        </Box>

        {selectedClient && (
          <>
            {error && (
              <Typography color="error" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            <Typography variant="h6" gutterBottom>
              Articles
            </Typography>
            <Box mb={4}>
              {articles.map((article, index) => (
                <Grid container spacing={2} key={index} alignItems="center">
                  <Grid item xs={4} sx={{ mb: 1 }}>
                    <Autocomplete
                      options={allArticles}
                      getOptionLabel={(option) =>
                        `${option.article} - ${option.qty_paquet} unitées`
                      }
                      onChange={(e, value) =>
                        handleArticleChange(index, "id", value?.id || "")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Article"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ mb: 1 }}>
                    <TextField
                      label="Quantité"
                      variant="outlined"
                      size="small"
                      type="number"
                      value={article.quantity}
                      onChange={(e) =>
                        handleArticleChange(index, "quantity", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              ))}
            </Box>
            <Button variant="outlined" onClick={handleAddArticle}>
              Ajouter un article
            </Button>

            {/* Summary Section */}
            <Typography variant="h6" mt={4}>
              Résumé des articles
            </Typography>
            <Box>
              <table
                style={{
                  width: "100%",
                  marginTop: "20px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Nom de l'article
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Quantité
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Quantité en stock
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Prix HTVA
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      TVA
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Prix avec TVA
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Total (HTVA)
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Total (avec TVA)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => {
                    const prixAvecTva =
                      article.prix_htva +
                      article.prix_htva * (article.tva / 100);
                    const totalHtva = article.prix_htva * article.quantity;
                    const totalAvecTva = prixAvecTva * article.quantity;

                    return (
                      <tr key={index}>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {article.article || ""}
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {article.quantity}
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {article.qty_stock}
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {Number(article.prix_htva || 0).toFixed(2)} €
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {article.tva} %
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {Number(article.prixAvecTva || 0).toFixed(2)} €
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {Number(article.totalHtva || 0).toFixed(2)} €
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {Number(article.totalAvecTva || 0).toFixed(2)} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>

            {/* Totals */}
            <Box mt={4} sx={{ mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography>
                Total (HTVA): {totals.subtotal.toFixed(2)} €
              </Typography>
              <Typography>TVA: {totals.tva.toFixed(2)} €</Typography>
              <Typography>
                Total (avec TVA): {totals.total.toFixed(2)} €
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{ padding: "15px 30px" }}
              onClick={handleSubmit}
            >
              Créer la facture
            </Button>
          </>
        )}
      </Container>
    </Layout>
  );
}

export default NewFacture;
