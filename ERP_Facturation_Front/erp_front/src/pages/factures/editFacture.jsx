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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Decimal } from "decimal.js";
import SearchBar from "../../components/searchbar";
import Layout from "../../components/layout";
import api from "../../api/axiosConfig";

function EditFacture() {
  const { numeroFacture } = useParams();
  const navigate = useNavigate();

  // --------------------
  // 1) Invoice & Clients
  // --------------------
  const [facture, setFacture] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientAddresses, setClientAddresses] = useState({
    facturation: null,
    livraison: null,
  });

  // ---------------------------
  // 2) The line items
  // ---------------------------
  // "articles" = raw data (quantity, remise%).
  // "computedArticles" = derived fields (prixAvecTva, totalHtva, etc.)
  const [articles, setArticles] = useState([]); 
  const [computedArticles, setComputedArticles] = useState([]); 

  // For adding new lines
  const [allArticles, setAllArticles] = useState([]);

  // ---------------------------
  // 3) Totals & Calculation
  // ---------------------------
  const [totals, setTotals] = useState({ subtotal: 0, tva: 0, total: 0 });
  const [basesImposables, setBasesImposables] = useState({});

  // ---------------------------
  // 4) UI and state
  // ---------------------------
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [articleSearchTerm, setArticleSearchTerm] = useState("");
  const [error, setError] = useState("");

  // If "statut" is "nouveau", we can edit
  const [editable, setEditable] = useState(false);

  // ---------------------------
  // 5) Load Facture + Details
  // ---------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Fetch all clients
        const clientsRes = await api.get("/clients/get-clients/");
        setClients(clientsRes.data);
        setFilteredClients(clientsRes.data);

        // 2) Fetch the facture data
        const factureRes = await api.get(`/factures/facture/${numeroFacture}/`);
        setFacture(factureRes.data);

        // 3) Check if we can edit
        setEditable(factureRes.data.statut === "nouveau");

        // 4) Identify the client
        const clientMatch = clientsRes.data.find(
          (c) => c.id === factureRes.data.client?.id
        );
        setSelectedClient(clientMatch || null);

        // 5) Fetch all articles (to add new lines)
        const articleRes = await api.get("/articles/get-articles/");
        setAllArticles(articleRes.data);
        setFilteredArticles(articleRes.data);

        // 6) Fetch the detailsFacture lines
        const detailsRes = await api.get(
          `/factures/facture/${numeroFacture}/details`
        );

        // Convert them to your "raw" front-end shape:
        // Django fields:
        //   - numero_ligne, quantite, prix_article_htva, tva, montant_promo, etc.
        const loadedLines = detailsRes.data.map((detail, idx) => {
          const quantite = Number(detail.quantite) || 0;
          const prixHTVA = Number(detail.prix_article_htva) || 0;
          const tva = Number(detail.tva) || 0;
          const promo = Number(detail.montant_promo) || 0;

          console.log("bizarre tout ça", promo);

          // Convert absolute discount => % remise (assuming 'promo' is that discount)
          let remisePct = promo;

          return {
            id: detail.article.id,
            article: detail.article.article,
            line_number: detail.numero_ligne || idx + 1,
            quantity: quantite,
            qty_stock: detail.article.qty_stock,
            prix_htva: prixHTVA,
            tva,
            // Our discount in the UI is a percent
            remise: remisePct,
          };
        });

        setArticles(loadedLines);
        console.log(loadedLines);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger la facture.");
      }
    };

    fetchData();
  }, [numeroFacture]);

  // ---------------------------
  // 6) Fetch Client Addresses
  // ---------------------------
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!selectedClient) {
        setClientAddresses({ facturation: null, livraison: null });
        return;
      }
      try {
        const res = await api.get(`/clients/${selectedClient.id}/addresses/`);
        setClientAddresses(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des adresses:", err);
      }
    };
    fetchAddresses();
  }, [selectedClient]);

  // -----------------------------------------------------------------
  // 7) Compute "computedArticles" & Totals from "articles"
  // -----------------------------------------------------------------
  useEffect(() => {
    let totalHTVA = new Decimal(0);
    let totalTVA = new Decimal(0);
    const tvaDetails = {};

    const updated = articles.map((line) => {
      const qty = new Decimal(line.quantity || 0);
      const prixHTVA = new Decimal(line.prix_htva || 0);
      const tvaRate = new Decimal(line.tva || 0);
      const remisePct = new Decimal(line.remise || 0);

      // 1) Compute the discounted unit price => partial round
      const prixRemise = prixHTVA
        .mul(Decimal(1).minus(remisePct.div(100)))
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      // 2) total HTVA => discounted unit * qty => partial round
      const totalHTVALine = prixRemise
        .mul(qty)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      // 3) TVA per unit => discounted unit * (tvaRate/100) => partial round
      const tvaParUnite = prixRemise
        .mul(tvaRate)
        .div(100)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      // 4) total TVA => tvaParUnite * qty => partial round
      const totalTVAArticle = tvaParUnite
        .mul(qty)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      // 5) line TTC => totalHTVALine + totalTVAArticle => partial round
      const lineTTC = totalHTVALine
        .plus(totalTVAArticle)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      // For "prixAvecTva": keep the *undiscounted* unit TTC ignoring discount
      const originalUnitTTC = prixHTVA
        .plus(prixHTVA.mul(tvaRate).div(100))
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      // Update the line summary
      const updatedLine = {
        ...line,
        prixAvecTva: originalUnitTTC.toNumber(),
        totalHtva: totalHTVALine.toNumber(),
        montantTva: totalTVAArticle.toNumber(),
        totalTtc: lineTTC.toNumber(),
      };

      // Accumulate in tvaDetails
      if (!tvaDetails[tvaRate]) {
        tvaDetails[tvaRate] = { baseHTVA: new Decimal(0), montantTVA: new Decimal(0) };
      }
      tvaDetails[tvaRate].baseHTVA = tvaDetails[tvaRate].baseHTVA.plus(totalHTVALine);
      tvaDetails[tvaRate].montantTVA = tvaDetails[tvaRate].montantTVA.plus(totalTVAArticle);

      totalHTVA = totalHTVA.plus(totalHTVALine);
      totalTVA = totalTVA.plus(totalTVAArticle);

      return updatedLine;
    });

    setComputedArticles(updated);

    // final totals => partial round
    const newSubtotal = totalHTVA
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();
    const newTVA = totalTVA.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    const newTotal = totalHTVA
      .plus(totalTVA)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();

    setTotals({
      subtotal: newSubtotal,
      tva: newTVA,
      total: newTotal,
    });

    // Build the basesImposables object
    const newBases = {};
    for (let rate in tvaDetails) {
      newBases[rate] = {
        baseHTVA: tvaDetails[rate].baseHTVA
          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
          .toNumber(),
        montantTVA: tvaDetails[rate].montantTVA
          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
          .toNumber(),
      };
    }
    setBasesImposables(newBases);
  }, [articles]);

  // -----------------------------------------
  // 8) Client selection & search
  // -----------------------------------------
  const handleOpenClientModal = () => {
    if (!editable) return;
    setClientModalOpen(true);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setClientModalOpen(false);
    setError("");
  };

  const handleClientSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setClientSearchTerm(term);
    const filtered = clients.filter((c) =>
      [
        c.nom,
        c.prenom,
        c.email,
        c.telephone,
        c.id,
        c.tva_entreprise,
        c.nom_entreprise,
      ]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(term))
    );
    setFilteredClients(filtered);
  };

  // -----------------------------------------
  // 9) Add an article
  // -----------------------------------------
  const handleOpenArticleModal = () => {
    if (!editable) return;
    if (!selectedClient) {
      setError("Veuillez d'abord sélectionner un client.");
      return;
    }
    setArticleModalOpen(true);
  };

  const handleArticleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setArticleSearchTerm(term);
    const filtered = allArticles.filter((art) =>
      [art.article, art.id, art.ean]
        .filter(Boolean)
        .some((val) => val.toString().toLowerCase().includes(term))
    );
    setFilteredArticles(filtered);
  };

  const getTVAArticle = async (article) => {
    const factAddress = clientAddresses?.facturation?.[0];
    if (!factAddress) return 0;

    const pays = factAddress.code_postal?.ville?.pays?.pays;
    const cat = article.categorie;
    const tvaClient = selectedClient?.tva_entreprise;

    const res = await api.get(`/articles/get-tva/${pays}/${cat}/${tvaClient}/`);
    return res.data?.tva || 0;
  };

  const handleAddArticle = async (article) => {
    setError("");
    if (article.qty_stock <= 0) {
      setError(
        `Stock insuffisant pour '${article.article}' (${article.qty_stock} en stock).`
      );
      setArticleModalOpen(false);
      return;
    }

    try {
      const fetchedTVA = await getTVAArticle(article);
      const newLine = {
        id: article.id,
        article: article.article,
        line_number: articles.length + 1,
        quantity: 0,
        qty_stock: article.qty_stock,
        prix_htva: Number(article.prix_htva) || 0,
        tva: Number(fetchedTVA) || 0,
        remise: 0,
      };
      setArticles((prev) => [...prev, newLine]);
      setArticleModalOpen(false);
    } catch (err) {
      console.error("Erreur ajout article:", err);
      setError("Impossible d'ajouter cet article.");
    }
  };

  // -----------------------------------------
  // 10) Remove or Edit a line
  // -----------------------------------------
  const handleRemoveArticle = (index) => {
    if (!editable) return;
    setArticles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleArticleChange = (index, field, value) => {
    if (!editable) return;
    setError("");

    setArticles((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "quantity") {
        let qty = Number(value) || 0;
        if (qty < 0) qty = 0;
        if (qty > item.qty_stock) {
          qty = item.qty_stock;
          setError("La quantité choisie dépasse le stock.");
        }
        item.quantity = qty;
      } else if (field === "remise") {
        let disc = Number(value) || 0;
        if (disc < 0) disc = 0;
        if (disc > 100) disc = 100;
        item.remise = disc;
      }

      updated[index] = item;
      return updated;
    });
  };

  // -----------------------------------------
  // 11) Submit / Update Facture
  // -----------------------------------------
  const handleSubmit = async () => {
    if (!facture) return;
    if (totals.total <= 0) {
      setError("Veuillez ajouter un article avec quantité > 0.");
      return;
    }

    try {
      // If your backend wants 'montant_promo' as an absolute discount,
      // we convert the percent remise back to an absolute discount.
      const detailsPayload = computedArticles.map((line) => {
        const originalUnitHT = line.prix_htva || 0; 
        const qty = line.quantity || 0;
        // total line original HT before discount
        const lineHTOriginal = originalUnitHT * qty;

        // total discount in absolute
        const promo = lineHTOriginal * (line.remise / 100);

        return {
          article_id: line.id,
          numero_ligne: line.line_number,
          quantite: line.quantity,
          prix_article_htva: line.totalHtva / (line.quantity || 1), 
          prix_article_ttc: line.totalTtc / (line.quantity || 1),
          tva: line.tva,
          montant_tva: line.montantTva,
          montant_promo: Number(promo.toFixed(2)),
        };
      });

      const payload = {
        client_id: selectedClient?.id,
        // rename "details" -> "articles"
        articles: computedArticles.map((line) => ({
          id: line.id,            // rename "article_id" -> "id"
          quantity: line.quantity, // rename "quantite" -> "quantity"
          remise: line.remise,
          line_number: line.line_number,
          // ...
        }))
      };

      await api.put(`/factures/facture/edit/${numeroFacture}/`, payload);
      navigate("/factures");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError("Impossible d'enregistrer la facture.");
    }
  };

  // -----------------------------------------
  // (New) 12) "Comptabiliser" => sets status to "comptabilisé"
  // -----------------------------------------
  const handleComptabiliser = async () => {
    if (!facture) return; // no invoice loaded
  
    try {
      // Minimal payload: only the "statut" field
      const payload = {
        statut: "comptabilisé",
        est_comptabilise: true,
      };
  
      // PUT or PATCH to your existing update endpoint
      await api.put(`/factures/facture/update-statut/${numeroFacture}/`, payload);
  
      // Locally set the invoice status + lock the UI
      setFacture((prev) => prev && { ...prev, statut: "comptabilisé" });
      setEditable(false);
      setError("");
    } catch (err) {
      console.error("Erreur lors de la comptabilisation:", err);
      setError("Impossible de comptabiliser la facture.");
    }
  };

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  return (
    <Layout>
      <Container maxWidth={false} sx={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Éditer la facture #{numeroFacture}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        {/* 1) Select or Display Client */}
        <Box display="flex" mb={4} alignItems="flex-start" gap={2}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleOpenClientModal}
              disabled={!editable}
            >
              Sélectionner un client
            </Button>
            <Typography sx={{ fontWeight: "bold", fontSize: "35px" }}>
              {selectedClient?.nom} {selectedClient?.prenom}
            </Typography>
          </Box>

          {/* Client Dialog */}
          <Dialog
            open={clientModalOpen}
            onClose={() => setClientModalOpen(false)}
            maxWidth="md"
          >
            <DialogTitle>Choisissez un client</DialogTitle>
            <SearchBar
              value={clientSearchTerm}
              onChange={handleClientSearch}
              placeholder="Rechercher un client"
            />
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Prénom</TableCell>
                      <TableCell>Numéro</TableCell>
                      <TableCell>TVA</TableCell>
                      <TableCell>Entreprise</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClients.map((cli) => (
                      <TableRow key={cli.id}>
                        <TableCell>{cli.nom}</TableCell>
                        <TableCell>{cli.prenom}</TableCell>
                        <TableCell>{cli.id}</TableCell>
                        <TableCell>{cli.tva_entreprise}</TableCell>
                        <TableCell>{cli.nom_entreprise}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => handleClientSelect(cli)}
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

          {/* Addresses */}
          {clientAddresses.facturation?.length > 0 && (
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

          {clientAddresses.livraison?.length > 0 && (
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

        {/* 2) Articles */}
        {selectedClient && (
          <>
            <Typography variant="h6" gutterBottom>
              Articles
            </Typography>
            <Box mb={4}>
              {articles.map((article, i) => (
                <Grid container spacing={1} key={i} alignItems="center">
                  <Grid item xs={3} sx={{ mb: 1 }}>
                    <Typography>
                      {article.article} (Stock: {article.qty_stock})
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ mb: 1 }}>
                    <TextField
                      label="Quantité"
                      variant="outlined"
                      size="small"
                      type="number"
                      disabled={!editable}
                      value={article.quantity}
                      onChange={(e) =>
                        handleArticleChange(i, "quantity", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ mb: 1 }}>
                    <TextField
                      label="Remise (%)"
                      variant="outlined"
                      size="small"
                      type="number"
                      disabled={!editable}
                      value={article.remise}
                      onChange={(e) =>
                        handleArticleChange(i, "remise", e.target.value)
                      }
                    />
                  </Grid>
                  {editable && (
                    <Grid item xs={2} sx={{ mb: 1 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveArticle(i)}
                      >
                        Supprimer
                      </Button>
                    </Grid>
                  )}
                </Grid>
              ))}
            </Box>

            {/* 2a) Dialog for adding article */}
            <Dialog
              open={articleModalOpen}
              onClose={() => setArticleModalOpen(false)}
              maxWidth="md"
            >
              <DialogTitle>Choisissez un Article</DialogTitle>
              <SearchBar
                value={articleSearchTerm}
                onChange={handleArticleSearch}
                placeholder="Rechercher un article"
              />
              <DialogContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Article</TableCell>
                        <TableCell>Qté paquet</TableCell>
                        <TableCell>Pourcentage Alcool</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredArticles.map((art) => (
                        <TableRow key={art.id}>
                          <TableCell>{art.article}</TableCell>
                          <TableCell>{art.qty_paquet}</TableCell>
                          <TableCell>{art.pourcentage_alc}</TableCell>
                          <TableCell>{art.qty_stock}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() => handleAddArticle(art)}
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
                <Button onClick={() => setArticleModalOpen(false)}>
                  Fermer
                </Button>
              </DialogActions>
            </Dialog>

            {editable && (
              <Button variant="outlined" onClick={handleOpenArticleModal}>
                Ajouter un article
              </Button>
            )}

            {/* 3) Résumé des articles */}
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
                    <th style={{ borderBottom: "1px solid #ddd" }}>Nom</th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>Quantité</th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>Stock</th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>Remise</th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>
                      Prix HTVA
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>TVA</th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>
                      Prix TTC/un
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>
                      Total HTVA
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd" }}>
                      Total TTC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {computedArticles.map((cArt, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.article}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.quantity}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.qty_stock}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.remise}%
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {Number(cArt.prix_htva).toFixed(2)} €
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.tva} %
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.prixAvecTva.toFixed(2)} €
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.totalHtva.toFixed(2)} €
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "8px",
                        }}
                      >
                        {cArt.totalTtc.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {/* 4) Totals + Bases Imposables */}
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
                        {Object.entries(basesImposables).map(([rate, vals]) => (
                          <TableRow key={rate}>
                            <TableCell>{rate} %</TableCell>
                            <TableCell>{vals.baseHTVA.toFixed(2)} €</TableCell>
                            <TableCell>{vals.montantTVA.toFixed(2)} €</TableCell>
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
              <Typography>Total (TTC): {totals.total.toFixed(2)} €</Typography>
            </Box>

            {/* If editable, show both Save & Comptabiliser */}
            {editable && (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ padding: "15px 30px", mr: 2 }}
                  onClick={handleSubmit}
                >
                  Enregistrer la facture
                </Button>

                {/* (New) Comptabiliser button */}
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ padding: "15px 30px" }}
                  onClick={handleComptabiliser}
                >
                  Comptabiliser
                </Button>
              </>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}

export default EditFacture;
