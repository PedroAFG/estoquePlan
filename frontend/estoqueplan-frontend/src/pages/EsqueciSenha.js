import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  GlobalStyles,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import logoEstoquePlan from "../assets/estoqueplan-logo.png";
import apiService from "../services/api";

const campoSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& input": {
      color: "#fff",
      caretColor: "#fff",
    },
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.6)",
    },
    "&:hover fieldset": {
      borderColor: "#fff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fff",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.75)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#fff",
  },
};

const EsqueciSenha = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!email) {
      setErro("Informe seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      await apiService.solicitarRedefinicaoSenha(email);

      setSucesso(
        "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
      );
    } catch (error) {
      setErro(error.message || "Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "input:-webkit-autofill": {
            WebkitBoxShadow:
              "0 0 0 1000px rgba(30, 95, 179, 1) inset !important",
            WebkitTextFillColor: "#fff !important",
            caretColor: "#fff !important",
          },
        }}
      />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #e3f2fd 0%, #f8fbff 45%, #ffffff 100%)",
          px: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 4,
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background:
              "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
            color: "#fff",
          }}
        >
          <Box
            component="img"
            src={logoEstoquePlan}
            sx={{ width: 280, mb: 3 }}
          />

          <Typography variant="h5" fontWeight={700}>
            Recuperar senha
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 1, mb: 3, color: "rgba(255,255,255,0.85)" }}
          >
            Informe seu e-mail para receber o link de recuperação
          </Typography>

          {erro && <Alert severity="error">{erro}</Alert>}
          {sucesso && <Alert severity="success">{sucesso}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              label="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#fff" }} />
                  </InputAdornment>
                ),
              }}
              sx={campoSx}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                backgroundColor: "#fff",
                color: "#1976d2",
                fontWeight: 700,
              }}
            >
              {loading ? <CircularProgress size={20} /> : "Enviar link"}
            </Button>
          </Box>

          <Typography
            sx={{ mt: 3, cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Voltar para login
          </Typography>
        </Paper>
      </Box>
    </>
  );
};

export default EsqueciSenha;