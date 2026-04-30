import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import logoEstoquePlan from "../assets/estoqueplan-logo.png";
import apiService from "../services/api";

const campoSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "transparent",

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

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!token) {
      setErro("Token de redefinição inválido ou ausente.");
      return;
    }

    if (!novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await apiService.redefinirSenha(token, novaSenha);

      setSucesso("Senha redefinida com sucesso! Redirecionando para o login...");

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      setErro(error.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "input:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px #1e5fb3 inset !important",
            WebkitTextFillColor: "#fff !important",
            caretColor: "#fff !important",
            borderRadius: "0 !important",
            transition: "background-color 9999s ease-in-out 0s !important",
          },
        }}
      />

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
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
            p: { xs: 4, sm: 5 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
            color: "#fff",
          }}
        >
          <Box
            component="img"
            src={logoEstoquePlan}
            alt="Logo estoquePlan"
            sx={{
              width: 280,
              mb: 3,
              objectFit: "contain",
            }}
          />

          <CheckCircleOutlineIcon
            sx={{
              fontSize: 48,
              color: "#fff",
              mb: 1,
            }}
          />

          <Typography
            variant="h5"
            fontWeight={700}
            textAlign="center"
            sx={{ color: "#fff" }}
          >
            Redefinir senha
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              mt: 0.5,
              mb: 3,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Informe sua nova senha para recuperar o acesso ao estoquePlan
          </Typography>

          {erro && (
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {erro}
            </Alert>
          )}

          {sucesso && (
            <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
              {sucesso}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              label="Nova senha"
              name="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              fullWidth
              disabled={loading || !!sucesso}
              margin="normal"
              variant="outlined"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#fff" }} />
                  </InputAdornment>
                ),
              }}
              sx={campoSx}
            />

            <TextField
              label="Confirmar senha"
              name="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              fullWidth
              disabled={loading || !!sucesso}
              margin="normal"
              variant="outlined"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#fff" }} />
                  </InputAdornment>
                ),
              }}
              sx={campoSx}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              type="submit"
              disabled={loading || !!sucesso}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
                backgroundColor: "#fff",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ color: "#1976d2", mr: 1 }}
                  />
                  Redefinindo...
                </>
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </Box>

          <Typography
            variant="body2"
            onClick={() => navigate("/login")}
            sx={{
              mt: 3,
              cursor: "pointer",
              fontWeight: 500,
              color: "#fff",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Voltar para o login
          </Typography>
        </Paper>
      </Box>
    </>
  );
};

export default RedefinirSenha;