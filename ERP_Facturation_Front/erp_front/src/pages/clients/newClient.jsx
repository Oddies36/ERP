import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Layout from "../../components/layout";

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
    same_address: ""
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
    const checked = e.target.checked;
    setSameAddress(checked);
  
    setClient((prevClient) => ({
      ...prevClient,
      same_address: checked,
      ...(checked && {
        rue_facturation: prevClient.rue_livraison,
        numero_facturation: prevClient.numero_livraison,
        boite_facturation: prevClient.boite_livraison,
        cp_facturation: prevClient.cp_livraison,
        ville_facturation: prevClient.ville_livraison,
        pays_facturation: prevClient.pays_livraison,
      }),
    }));
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const dataToSend = transformData(client);
    console.log(dataToSend);
    try {
      const response = await api.post("/clients/new/", dataToSend);
      navigate("/clients");
    } catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        if (errorData.Client) {
          setError(`Erreur: ${errorData.Client}`);
        } else {
          setError("Erreur.");
        }
      } else {
        setError("Erreur lors de la connexion au serveur.");
      }
      console.error("Erreur lors de la création du client:", err);
    }
  };

  const transformData = (client) => ({
    
    nom: client.nom,
    prenom: client.prenom,
    telephone: client.telephone,
    email: client.email,
    nom_entreprise: client.nom_entreprise || null,
    tva_entreprise: client.tva_entreprise || null,
    
    adresses: [
      {
        type_adresses: [
          { type_adresse: "Livraison" }
        ],
        rue: client.rue_livraison,
        numero: client.numero_livraison,
        boite: client.boite_livraison || null,
        code_postal: {
          cp: client.cp_livraison,
          ville: {
            ville: client.ville_livraison,
            pays: {
              pays: client.pays_livraison,
              code_iso: client.code_iso_livraison || null,
            },
          },
        },
      },
      {
        type_adresses: [
          { type_adresse: "Facturation" }
        ],
        rue: client.rue_facturation,
        numero: client.numero_facturation,
        boite: client.boite_facturation || null,
        code_postal: {
          cp: client.cp_facturation,
          ville: {
            ville: client.ville_facturation,
            pays: {
              pays: client.pays_facturation,
              code_iso: client.code_iso_facturation || null,
            },
          },
        },
      },
    ],
  });

  return (
    <Layout>
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
            {/* Information du client */}
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

            {/* Adresse */}
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
                  <MenuItem key={`livraison-${option.id}`} value={option.pays}>
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
                  <MenuItem key={`facturation-${option.id}`} value={option.pays}>
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

          {/* Bouton créer */}
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
    </Layout>
  );
};

export default NewClient;
