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
import Grid from "@mui/material/Grid2";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import HomeIcon from '@mui/icons-material/Home';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';

const NewClient = () => {
  const [client, setClient] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    nom_entreprise: "",
    tva_entreprise: "",
    rue_livraison: "",
    numero_livraison: "",
    boite_livraison: "",
    cp_livraison: "",
    ville_livraison: "",
    pays_livraison: "",
    rue_facturation: "",
    numero_facturation: "",
    boite_facturation: "",
    cp_facturation: "",
    ville_facturation: "",
    pays_facturation: "",
    same_address: "",
  });

  const [listePays, setListePays] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [sameAddress, setSameAddress] = useState(false);

  useEffect(() => {
    const getPays = async () => {
      try {
        const responsePays = await api.get("/clients/get-pays/");
        setListePays(responsePays.data);
      } catch (err) {
        setError("Erreur lors de la récuperation des pays.");
      }
    };
    getPays();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  const handleSwitch = (e) => {
    if (e.target.checked) {
      setSameAddress(true);
      setClient((prevClient) => ({
        ...prevClient,
        same_address: true,
      }));

      setClient((prevClient) => ({
        ...prevClient,
        rue_facturation: prevClient.rue_livraison,
        numero_facturation: prevClient.numero_livraison,
        boite_facturation: prevClient.boite_livraison,
        cp_facturation: prevClient.cp_livraison,
        ville_facturation: prevClient.ville_livraison,
        pays_facturation: prevClient.pays_livraison,
      }));

      console.log(client.rue_facturation);
    } else {
      setSameAddress(false);
      setClient((prevClient) => ({
        ...prevClient,
        same_address: false,
      }));
    }
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
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
    <Box>
      {/* Top Bar */}
      <AppBar position="static"
      sx={{
        backgroundImage: "url(/images/appbar.jpg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
  }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERP Facturation
          </Typography>
          <Button color="inherit" onClick={() => handleNavigation("/logout")}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box display="flex" sx={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: "250px",
            backgroundColor: "#1722C9",
            color: "#fff",
            
          }}
        >
          <Box>
            
            <Box
              component={NavLink}
              to="/home"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                marginTop: 5,
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <HomeIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Page d'accueil
              </Typography>
            </Box>
            <Box
              component={NavLink}
              to="/clients"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <PersonSearchIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Clients
              </Typography>
            </Box>
            <Box
              component={NavLink}
              to="/"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <InventoryIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Articles
              </Typography>
            </Box>
            <Box
              component={NavLink}
              to="/"
              sx={{
                color: "#fff",
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  backgroundColor: "#5ea5e5"
                },
                "&.active": {
                  backgroundColor: "#1976d2"
                }
              }}
           >   
              <ReceiptIcon sx={{ marginRight: 1, marginLeft: 2 }} />
              <Typography variant="body1" sx={{ color: "inherit" }}>
                Factures
              </Typography>
            </Box>
          </Box>
        </Box>

      <Container sx={{ mt: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                Adresse de livraison
              </Typography>
              <TextField
                fullWidth
                label="Rue"
                name="rue_livraison"
                value={client.rue_livraison}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Numéro"
                name="numero_livraison"
                value={client.numero_livraison}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Boîte"
                name="boite_livraison"
                value={client.boite_livraison}
                onChange={handleChange}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Code Postal"
                name="cp_livraison"
                value={client.cp_livraison}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Ville"
                name="ville_livraison"
                value={client.ville_livraison}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              />
              <TextField
                select
                fullWidth
                label="Pays"
                name="pays_livraison"
                value={client.pays_livraison}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
              >
                {listePays.map((option) => (
                  <MenuItem key={`livraison-${option.id}`} value={option.id}>
                    {option.pays}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                Adresse de facturation
              </Typography>
              <TextField
                fullWidth
                label="Rue"
                name="rue_facturation"
                value={client.rue_facturation}
                onChange={handleChange}
                required
                disabled={sameAddress}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Numéro"
                name="numero_facturation"
                value={client.numero_facturation}
                onChange={handleChange}
                required
                disabled={sameAddress}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Boîte"
                name="boite_facturation"
                value={client.boite_facturation}
                onChange={handleChange}
                disabled={sameAddress}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Code Postal"
                name="cp_facturation"
                value={client.cp_facturation}
                onChange={handleChange}
                required
                disabled={sameAddress}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Ville"
                name="ville_facturation"
                value={client.ville_facturation}
                onChange={handleChange}
                required
                disabled={sameAddress}
                sx={{ mb: 1 }}
              />
              <TextField
                select
                fullWidth
                label="Pays"
                name="pays_facturation"
                value={client.pays_facturation}
                onChange={handleChange}
                required
                disabled={sameAddress}
                sx={{ mb: 3 }}
              >
                {listePays.map((option) => (
                  <MenuItem key={`facturation-${option.id}`} value={option.id}>
                    {option.pays}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <FormControlLabel
            sx={{ mb: 3 }}
            control={<Switch checked={sameAddress} onChange={handleSwitch} />}
            label="L'adresse de facturation est la même que l'adresse de livraison"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ padding: "15px 30px" }}
          >
            Créer le client
          </Button>
        </form>
      </Container>
    </Box>
    </Box>
  );
};

export default NewClient;
