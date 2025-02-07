import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import Layout from "../../components/layout";
import { BarChart } from "@mui/x-charts/BarChart";
import api from "../../api/axiosConfig";

const Homepage = () => {
  const [lowStockArticles, setLowStockArticles] = useState([]);
  const [totalFactures, setTotalFactures] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalComptabilisedFactures, setTotalComptabilisedFactures] = useState(0);

  useEffect(() => {

    const fetchArticles = async () => {
      try {
        const response = await api.get("/articles/get-articles/");
        const filteredArticles = response.data.filter(
          (article) => article.qty_stock < article.qty_min
        );
        
        setLowStockArticles(filteredArticles);
        setTotalArticles(response.data.length);
      } catch (error) {
        console.error("Erreur de la récuperation des articles:", error);
      }
    };

    const fetchClients = async () => {
      try{
        const response = await api.get("/clients/get-clients");
        setTotalClients(response.data.length);
      } catch (error) {
        console.error("Erreur de récuperation des clients", error);
      }
    }

    const fetchFactures = async () => {
      try {
        const response = await api.get("/factures/get-factures/");

        const filteredFactures = response.data.filter((facture) => facture.est_comptabilise);
        const totalTTC = filteredFactures.reduce((sum, facture) => sum + parseFloat(facture.prix_ttc || 0), 0);
        setTotalComptabilisedFactures(totalTTC);


        setTotalFactures(response.data.length);
      } catch (error) {
        console.error("Error fetching factures:", error);
      }
    };

    fetchArticles();
    fetchClients();
    fetchFactures();
  }, []);

  return (
    <Layout>
      <Container maxWidth={false} sx={{ padding: "20px" }}>
        {/* Nombre de factures */}
        <Box sx={{display: "flex", gap: 2, mb: 4}}>
        <Box
          sx={{
            width: 200,
            height: 120,
            backgroundColor: "#2196F3",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography variant="h6">Total Factures</Typography>
          <Typography variant="h4">{totalFactures}</Typography>
        </Box>
        {/* Nombre d'articles */}
        <Box
          sx={{
            width: 200,
            height: 120,
            backgroundColor: "#2196F3",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography variant="h6">Total Articles</Typography>
          <Typography variant="h4">{totalArticles}</Typography>
        </Box>
        {/* Nombre de clients */}
        <Box
          sx={{
            width: 200,
            height: 120,
            backgroundColor: "#2196F3",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography variant="h6">Total Clients</Typography>
          <Typography variant="h4">{totalClients}</Typography>
        </Box>
        {/* Total TTC des factures comptablisés */}
        <Box
          sx={{
            width: 200,
            height: 120,
            backgroundColor: "#2196F3",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography variant="h6">Total Comptabilisés</Typography>
          <Typography variant="h4">{totalComptabilisedFactures}€</Typography>
        </Box>
        </Box>

        {/* Graphique stock */}
        <Typography variant="h4" gutterBottom>
          Articles à restocker
        </Typography>
        {lowStockArticles.length > 0 ? (
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: lowStockArticles.map((article) => article.article),
              },
            ]}
            series={[
              {
                data: lowStockArticles.map((article) => article.qty_stock),
                label: "Stock Level",
              },
            ]}
            width={600}
            height={400}
          />
        ) : (
          <Typography>Pas besoin de stock.</Typography>
        )}
      </Container>
    </Layout>
  );
};

export default Homepage;
