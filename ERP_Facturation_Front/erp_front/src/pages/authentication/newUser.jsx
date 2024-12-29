import React, { useState } from "react";
import axios from "../../api/axiosConfig";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
} from "@mui/material";
import { Link } from "react-router-dom";

const NewUser = () => {
  const [newUserForm, setNewUserForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    dateJoined: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewUserForm({ ...newUserForm, [name]: value });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: "url(/images/background.jpg)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          variant="outlined"
          elevation={8}
          sx={{
            padding: 4,
            width: "100%",
            textAlign: "center",
            borderRadius: 2,
            borderColor: "black",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Créer un nouvel utilisateur
          </Typography>

          {error && (
            <Typography variant="body1" color="error" gutterBottom>
              {error}
            </Typography>
          )}

          <form>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="Prénom"
                name="firstname"
                value={newUserForm.firstname}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="Nom"
                name="lastname"
                value={newUserForm.lastname}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#115293",
                },
                width: "50%",
              }}
            >
              Valider
            </Button>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default NewUser;
