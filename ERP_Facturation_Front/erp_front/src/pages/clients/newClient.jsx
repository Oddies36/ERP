import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  AppBar,
  Toolbar,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

const NewClient = () => {
  const [client, setClient] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    nom_entreprise: "",
    tva_entreprise: "",
    rue: "",
    numero: "",
    boite: "",
    cp: "",
    ville: "",
    pays: "",
    type_adresse: "",
  });

  const [paysOptions, setPaysOptions] = useState([]);
  const [typeAdresseOptions, setTypeAdresseOptions] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [paysResponse, typeAdresseResponse] = await Promise.all([
          api.get("/pays/"),
          api.get("/type-adresse/"),
        ]);
        setPaysOptions(paysResponse.data);
        setTypeAdresseOptions(typeAdresseResponse.data);
      } catch (err) {
        setError("Failed to fetch dropdown options.");
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/clients/new/", client);
      console.log("Client created:", response.data);
      navigate("/clients");
    } catch (err) {
      console.error("Error creating client:", err);
      setError("Failed to create client.");
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERP Facturation
          </Typography>
          <Button color="inherit" onClick={() => navigate("/clients")}>
            Retour à la liste des clients
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ajouter un client
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Client Information */}
            <Grid size={{xs: 12, md: 4}}>
              <Typography variant="h6" gutterBottom>
                Informations du client
              </Typography>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={client.nom}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Prénom"
                name="prenom"
                value={client.prenom}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={client.telephone}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={client.email}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Nom de l'entreprise (Optionnel)"
                name="nom_entreprise"
                value={client.nom_entreprise}
                onChange={handleChange}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="TVA de l'entreprise (Optionnel)"
                name="tva_entreprise"
                value={client.tva_entreprise}
                onChange={handleChange}
                sx={{ mb: 1 }}
              />
            </Grid>

            {/* Address Information */}
            <Grid size={{xs: 12, md: 4}}>
              <Typography variant="h6" gutterBottom>
                Adresse de livraison
              </Typography>
              <TextField
                fullWidth
                label="Rue"
                name="rue"
                value={client.rue}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Numéro"
                name="numero"
                value={client.numero}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Boîte"
                name="boite"
                value={client.boite}
                onChange={handleChange}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Code Postal"
                name="cp"
                value={client.cp}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Ville"
                name="ville"
                value={client.ville}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                select
                fullWidth
                label="Pays"
                name="pays"
                value={client.pays}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              >
                {paysOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.pays}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{xs: 12, md: 4}}>
              <Typography variant="h6" gutterBottom>
                Adresse de facturation
              </Typography>
              <TextField
                fullWidth
                label="Rue"
                name="rue"
                value={client.rue}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Numéro"
                name="numero"
                value={client.numero}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Boîte"
                name="boite"
                value={client.boite}
                onChange={handleChange}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Code Postal"
                name="cp"
                value={client.cp}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Ville"
                name="ville"
                value={client.ville}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                select
                fullWidth
                label="Pays"
                name="pays"
                value={client.pays}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              >
                {paysOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.pays}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Button type="submit" variant="contained" fullWidth>
            Créer le client
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default NewClient;