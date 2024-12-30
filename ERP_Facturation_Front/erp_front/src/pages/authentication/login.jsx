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
import { Link, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/token/", {
        username: credentials.username,
        password: credentials.password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      console.log("Login ok: ", response.data);
      setError("");
      navigate("/home");
    } catch (err) {
      console.error("login error: ", err);
      setError("Login failed");
    }
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
            Login
          </Typography>

          {error && (
            <Typography variant="body1" color="error" gutterBottom>
              {error}
            </Typography>
          )}

          <form onSubmit={handleLogin}>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <Box sx={{ marginBottom: 1 }}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <Box
              fullWidth
              display="flex"
              justifyContent={"space-between"}
              sx={{ marginBottom: 2 }}
            >
              <Typography
                component={Link}
                to="/creation-user"
                sx={{
                  textAlign: "left",
                }}
              >
                Créer un compte
              </Typography>
              <Typography
                sx={{
                  textAlign: "right",
                }}
              >
                Mot de passe oublié
              </Typography>
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
              Login
            </Button>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
