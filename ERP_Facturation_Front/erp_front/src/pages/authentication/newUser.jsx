import React, { useState } from "react";
import api from "../../api/axiosConfig";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const NewUser = () => {
  const navigate = useNavigate();
  const [newUserForm, setNewUserForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm({ ...newUserForm, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    checkPasswordMatch(newUserForm.password, newUserForm.passwordConfirm)

      if(!passwordError){
      console.log("im in");
      try {
        const response = await api.post("users/create-user/", newUserForm);
  
        if (response.data.success) {
          console.log("Utilisateur créé avec success.");
  
          await Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Utilisatuer créé avec succès",
            showConfirmButton: false,
            timer: 1500,
          });
  
          navigate("/login");
        } else {
          console.error("Erruer:", response.data.message);
          setError(response.data.errors);
          if (response.data.errors) {
            const firstError = Object.values(response.data.errors)[0][0];
            setError(firstError);
          }
        }
      } catch (err) {
        if (err.response && err.response.data) {
          console.error("Erreur du serveur:", err.response.data.message);
  
          if (err.response.data.errors) {
            const firstError = Object.values(err.response.data.errors)[0][0];
            setError(firstError);
          } else {
            setError(err.response.data.message);
          }
        } else {
          console.error("Erreur inconnue:", err.message);
          setError("Une erreur inconnue s'est produite.");
        }
      }
    }
    else{
      setPasswordError(true);
      setError("Le mot de passe ne correspond pas.")
    }

  };

  function checkPasswordMatch(password, passwordConfirm) {
    if (password === passwordConfirm) {
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={3}
          fullWidth
          sx={{
            padding: "2rem",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <Box sx={{ marginBottom: "1.5rem" }}>
            <img
              src="/images/logo.jpg"
              alt="ERP Logo"
              style={{
                maxWidth: "150px",
                height: "auto",
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{ marginBottom: "1rem", fontWeight: 600 }}
          >
            Créer votre compte
          </Typography>

          {error && (
            <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={1}>
              <Grid size={6}>
                <TextField
                  label="Prénom"
                  name="first_name"
                  value={newUserForm.first_name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Email"
                  name="email"
                  value={newUserForm.email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Nom"
                  name="last_name"
                  value={newUserForm.last_name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={newUserForm.password}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Nom d'utilisateur"
                  name="username"
                  value={newUserForm.username}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Confirmer mot de passe"
                  name="passwordConfirm"
                  type="password"
                  value={newUserForm.passwordConfirm}
                  onChange={handleChange}
                  fullWidth
                  error={passwordError}
                  onBlur={() =>
                    checkPasswordMatch(
                      newUserForm.password,
                      newUserForm.passwordConfirm
                    )
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: passwordError ? "red" : "default",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                marginTop: 4,
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Créer un compte
            </Button>
          </form>

          <Box textAlign="center" marginTop={2}>
            <Typography
              component={Link}
              to="/login"
              sx={{
                textDecoration: "none",
                color: "primary.main",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Retour à la connexion
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default NewUser;
