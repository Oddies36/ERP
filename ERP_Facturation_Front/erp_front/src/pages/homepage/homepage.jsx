import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import Layout from "../../components/layout";
import { BarChart } from "@mui/x-charts/BarChart";
import api from "../../api/axiosConfig"; // Ensure Axios is set up

const Homepage = () => {
  const [lowStockArticles, setLowStockArticles] = useState([]);
  const [totalFactures, setTotalFactures] = useState(0);

  useEffect(() => {
    // Fetch Articles with Low Stock
    const fetchArticles = async () => {
      try {
        const response = await api.get("/articles/get-articles/");
        const filteredArticles = response.data.filter(
          (article) => article.qty_stock < article.qty_min
        );
        setLowStockArticles(filteredArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    // Fetch Number of Factures
    const fetchFactures = async () => {
      try {
        const response = await api.get("/factures/get-factures/");
        setTotalFactures(response.data.length);
      } catch (error) {
        console.error("Error fetching factures:", error);
      }
    };

    fetchArticles();
    fetchFactures();
  }, []);

  return (
    <Layout>
      <Container maxWidth={false} sx={{ padding: "20px" }}>
        {/* Factures Count Box */}
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

        {/* Low Stock Chart */}
        <Typography variant="h4" gutterBottom>
          Articles à restocker
        </Typography>
        {lowStockArticles.length > 0 ? (
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: lowStockArticles.map((article) => article.article), // Article names
              },
            ]}
            series={[
              {
                data: lowStockArticles.map((article) => article.qty_stock), // Stock levels
                label: "Stock Level",
              },
            ]}
            width={600}
            height={400}
          />
        ) : (
          <Typography>No low stock articles found.</Typography>
        )}
      </Container>
    </Layout>
  );
};

export default Homepage;
