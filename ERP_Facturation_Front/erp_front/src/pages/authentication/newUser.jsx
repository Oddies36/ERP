import React, { useState } from "react";
import api from "../../api/axiosConfig";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
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
    dateJoined: "",
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm({ ...newUserForm, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      <Container maxWidth="sm">
        <Card
          variant="outlined"
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 2,
            borderColor: "black",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: { xs: "center" } }}
          >
            Créer un nouvel utilisateur
          </Typography>

          {error && (
            <Typography variant="body1" color="error" gutterBottom>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid
              container
              spacing={2}
              sx={{ justifyContent: { xs: "center" } }}
            >
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="first_name"
                  value={newUserForm.first_name}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="last_name"
                  value={newUserForm.last_name}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  name="username"
                  value={newUserForm.username}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={newUserForm.email}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  value={newUserForm.password}
                  onChange={handleChange}
                  type="password"
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: passwordError ? "red" : "default",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Confirmer mot de passe"
                  name="passwordConfirm"
                  value={newUserForm.passwordConfirm}
                  onChange={handleChange}
                  onBlur={() =>
                    checkPasswordMatch(
                      newUserForm.password,
                      newUserForm.passwordConfirm
                    )
                  }
                  type="password"
                  variant="outlined"
                  size="small"
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                type="submit"
                sx={{
                  width: { xs: "100%", sm: "50%" },
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#115293",
                  },
                }}
                disabled={passwordError}
              >
                Valider
              </Button>
            </Box>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default NewUser;
