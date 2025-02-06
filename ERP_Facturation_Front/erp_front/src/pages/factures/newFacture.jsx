import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import SearchBar from "../../components/searchbar";
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
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [basesImposables, setBasesImposables] = useState([]);

  useEffect(() => {
    const getClients = async () => {
      try {
        const response = await api.get("/clients/get-clients/");
        setClients(response.data);
        setFilteredClients(response.data);
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
          setClientAddresses(response.data);
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
          setAllArticles(response.data);
          setFilteredArticles(response.data);
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
    const basesImposables = {}; // Object to store the taxable base per VAT rate
    const tvaDetails = {}; // Object to store calculated TVA per rate
    let totalTVA = new Decimal(0);
    let totalHTVA = new Decimal(0);

    articles.forEach(article => {
        const tauxTVA = Number(article.tva) || 0; // Ensure VAT rate is a number
        const prixHTVA = Number(article.prix_htva) || 0; // Ensure HTVA is a number
        const remise = Number(article.remise) || 0; // Ensure remise is a number
        const quantity = Number(article.quantity) || 0; // Ensure quantity is a number

        if (!basesImposables[tauxTVA]) {
            basesImposables[tauxTVA] = new Decimal(0);
            tvaDetails[tauxTVA] = { baseHTVA: new Decimal(0), montantTVA: new Decimal(0) };
        }

        // ✅ Apply remise before calculations
        const prixRemisé = Decimal(prixHTVA)
            .times(Decimal(1).minus(Decimal(remise).div(100))) // Apply discount
            .toDecimalPlaces(2);

        // ✅ Compute total HTVA for this article after remise
        const totalHTVAArticle = prixRemisé
            .times(quantity)
            .toDecimalPlaces(2);

        // ✅ Compute TVA per unit after remise
        const tvaParUnite = prixRemisé
            .times(tauxTVA)
            .div(100)
            .toDecimalPlaces(2);

        // ✅ Compute total TVA for this article
        const totalTVAArticle = tvaParUnite
            .times(quantity)
            .toDecimalPlaces(2);

        // ✅ Update taxable base and TVA amounts per VAT rate
        basesImposables[tauxTVA] = basesImposables[tauxTVA].plus(totalHTVAArticle);
        tvaDetails[tauxTVA].baseHTVA = basesImposables[tauxTVA];
        tvaDetails[tauxTVA].montantTVA = tvaDetails[tauxTVA].montantTVA.plus(totalTVAArticle);

        // ✅ Update overall totals
        totalHTVA = totalHTVA.plus(totalHTVAArticle);
        totalTVA = totalTVA.plus(totalTVAArticle);
    });

    // Convert Decimal values to numbers before updating state
    setTotals({
        subtotal: totalHTVA.toDecimalPlaces(2).toNumber(),
        tva: totalTVA.toDecimalPlaces(2).toNumber(),
        total: totalHTVA.plus(totalTVA).toDecimalPlaces(2).toNumber(),
    });

    // Convert basesImposables values to numbers before updating state
    const formattedTVADetails = Object.keys(tvaDetails).reduce((acc, tauxTVA) => {
        acc[tauxTVA] = {
            baseHTVA: tvaDetails[tauxTVA].baseHTVA.toDecimalPlaces(2).toNumber(),
            montantTVA: tvaDetails[tauxTVA].montantTVA.toDecimalPlaces(2).toNumber(),
        };
        return acc;
    }, {});

    setBasesImposables(formattedTVADetails);
}, [articles]);

  
  
  

  // Handle Client Selection from Modal
  const handleClientSelect = (client) => {
    setError("");
    setSelectedClient(client);
    setClientModalOpen(false);
    setArticles([]);
    setTotals({ subtotal: 0, tva: 0, total: 0 });
  };

  const handleArticleModal = () => {
    setArticleModalOpen(true);
  };

  const getTVAArticle = async (article) => {
    const pays =
      clientAddresses.facturation?.[0]?.code_postal?.ville?.pays?.pays;

    if (pays) {
      const tvaResponse = await api.get(
        `/articles/get-tva/${pays}/${article.categorie}/${selectedClient.tva_entreprise}/`
      );
      return tvaResponse.data.tva;
    }
  };

  const handleAddArticle = async (article) => {
    if (article.qty_stock > 0) {
      setError("");
      const tva = await getTVAArticle(article);
  
      // Convert values to numbers
      const prixHTVA = Number(article.prix_htva);
      const tauxTVA = Number(tva);
  
      // ✅ Compute prixAvecTva immediately
      const prixAvecTva = Decimal(prixHTVA)
        .times(Decimal(1).plus(Decimal(tauxTVA).div(100)))
        .toDecimalPlaces(2)
        .toNumber();
  
      // ✅ Initialize total values as 0 since quantity is 0
      const newArticle = {
        id: article.id,
        article: article.article,
        line_number: articles.length + 1,
        quantity: 0, // Start with 0
        qty_stock: article.qty_stock,
        prix_htva: prixHTVA, // Store as number
        tva: tauxTVA, // Store as number
        prixAvecTva, // ✅ Now calculated on add
        totalHtva: 0,
        montantTva: 0,
        totalTtc: 0,
        remise: 0
      };
  
      // ✅ Update state with the new article
      setArticles((prevArticles) => [...prevArticles, newArticle]);
  
      setArticleModalOpen(false);
    } else {
      setArticleModalOpen(false);
      setError(
        `Nombre de stock insuffisant pour ${article.article} ${article.qty_paquet}`
      );
    }
  };
  

  const handleRemoveArticle = (index) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const handleArticleChange = async (index, field, value) => {
    setError("");
    const updatedArticles = [...articles];


    if (field === "remise") {
      if(value > 100){
        updatedArticles[index][field] = 100;
      } else if(value < 1){
        updatedArticles[index][field] = 0;
      } else{
        updatedArticles[index][field] = value;
      }
    }
  
    if (field === "quantity") {
      const currentArticle = updatedArticles[index];
      
      // Prevent exceeding stock limits
      if (value > currentArticle.qty_stock) {
        setError("La quantité choisie dépasse le nombre en stock");
        updatedArticles[index][field] = currentArticle.qty_stock;
      } else if (value < 1) {
        updatedArticles[index][field] = 0; // Minimum quantity = 0
      } else {
        updatedArticles[index][field] = value;
      }
    }

    // Convert values to numbers before calculations
    const article = updatedArticles[index];
    const prixHTVA = Number(article.prix_htva); // Convert from string to number
    const tauxTVA = Number(article.tva); // Convert from string to number
    const remise = Number(article.remise);
    if (!isNaN(prixHTVA) && !isNaN(tauxTVA)) {
      // ✅ Apply remise before calculations
      const prixRemisé = Decimal(prixHTVA)
        .times(Decimal(1).minus(Decimal(remise).div(100))) // Apply discount
        .toDecimalPlaces(2)
        .toNumber();

      // ✅ Calculate total HTVA after remise
      const totalHTVA = Decimal(prixRemisé)
        .times(article.quantity)
        .toDecimalPlaces(2)
        .toNumber();

      // ✅ Calculate TVA per unit based on discounted price
      const tvaParUnite = Decimal(prixRemisé)
        .times(tauxTVA)
        .div(100)
        .toDecimalPlaces(2);

      // ✅ Calculate total TVA
      const montantTVA = tvaParUnite
        .times(article.quantity)
        .toDecimalPlaces(2)
        .toNumber();

      // ✅ Calculate total TTC
      const totalTTC = Decimal(totalHTVA)
        .plus(montantTVA)
        .toDecimalPlaces(2)
        .toNumber();

      updatedArticles[index] = {
        ...article,
        prixRemisé, // Store the discounted unit price
        totalHtva: totalHTVA,
        montantTva: montantTVA,
        totalTtc: totalTTC,
      };
    }

    setArticles(updatedArticles);

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
        client.id,
        client.tva_entreprise,
        client.nom_entreprise,
      ]
        .filter(Boolean) // Remove any undefined/null values
        .some((field) => field.toString().toLowerCase().includes(term))
    );

    setFilteredClients(filtered);
  };

  const handleArticleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = allArticles.filter((article) =>
      [article.article, article.id, article.ean]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(term))
    );

    setFilteredArticles(filtered);
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
            remise: parseFloat(article.remise)
          })),
        };

        const response = await api.post("/factures/new-facture/", payload);
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
          {/* Client Selection */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              onClick={() => setClientModalOpen(true)}
            >
              Sélectionner un client
            </Button>
            <Typography sx={{ fontWeight: "bold", fontSize: "35px" }}>
              {selectedClient?.nom} {selectedClient?.prenom}
            </Typography>
          </Box>
          <Dialog
            open={clientModalOpen}
            onClose={() => setClientModalOpen(false)}
            maxWidth="md"
          >
            <DialogTitle>Choisissez un client</DialogTitle>
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Rechercher de client"
            />
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Prénom</TableCell>
                      <TableCell>Numéro du client</TableCell>
                      <TableCell>TVA entreprise</TableCell>
                      <TableCell>Nom entreprise</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.nom}</TableCell>
                        <TableCell>{client.prenom}</TableCell>
                        <TableCell>{client.id}</TableCell>
                        <TableCell>{client.tva_entreprise}</TableCell>
                        <TableCell>{client.nom_entreprise}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => handleClientSelect(client)}
                          >
                            Sélectionner
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setClientModalOpen(false)}>Fermer</Button>
            </DialogActions>
          </Dialog>
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
                <Grid container spacing={1} key={index} alignItems="center">
                  <Grid item xs={1} sx={{ mb: 1 }}>
                    <Typography>
                      {article.article} {article.qty_paquet}
                    </Typography>
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
                  <Grid item xs={3} sx={{ mb: 1 }}>
                    <TextField
                      label="Remise (%)"
                      variant="outlined"
                      size="small"
                      type="number"
                      value={article.remise}
                      onChange={(e) =>
                        handleArticleChange(index, "remise", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              ))}
            </Box>

            <Dialog
              open={articleModalOpen}
              onClose={() => setArticleModalOpen(false)}
              maxWidth="md"
            >
              <DialogTitle>Choisissez un Article</DialogTitle>
              <SearchBar
                value={searchTerm}
                onChange={handleArticleSearch}
                placeholder="Rechercher d'un article'"
              />
              <DialogContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Article</TableCell>
                        <TableCell>Quantité paquet</TableCell>
                        <TableCell>Pourcentage Alcool</TableCell>
                        <TableCell>Quantité en stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>{article.article}</TableCell>
                          <TableCell>{article.qty_paquet}</TableCell>
                          <TableCell>{article.pourcentage_alc}</TableCell>
                          <TableCell>{article.qty_stock}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() => handleAddArticle(article)}
                            >
                              Sélectionner
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setClientModalOpen(false)}>
                  Fermer
                </Button>
              </DialogActions>
            </Dialog>

            <Button variant="outlined" onClick={handleArticleModal}>
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
                      Remise
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Prix Article HTVA
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
                      Prix Article TTC
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Total HTVA
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Total TTC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => {

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
                          {article.remise}%
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
                          {Number(article.prixAvecTva).toFixed(2)} €
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {Number(article.totalHtva).toFixed(2)} €
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            padding: "8px",
                          }}
                        >
                          {Number(article.totalTtc).toFixed(2)} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>

            {/* Totals */}
            <Box mt={4} sx={{ mb: 2 }}>
            {Object.keys(basesImposables).length > 0 && (
  <>
    <Typography variant="h6" mt={4}>
      Détails des bases imposables par taux de TVA
    </Typography>
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Taux de TVA</TableCell>
            <TableCell>Base Imposable (HTVA)</TableCell>
            <TableCell>Montant de TVA</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(basesImposables).map(([tauxTVA, details]) => (
            <TableRow key={tauxTVA}>
              <TableCell>{tauxTVA} %</TableCell>
              <TableCell>{details.baseHTVA.toFixed(2)} €</TableCell>
              <TableCell>{details.montantTVA.toFixed(2)} €</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
)}
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
