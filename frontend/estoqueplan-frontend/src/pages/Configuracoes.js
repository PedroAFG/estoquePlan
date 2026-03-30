import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import apiService from "../services/api";

import {
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

const emptyPerfilForm = {
  nome: "",
  sobrenome: "",
  dataNascimento: "",
  login: "",
};

const emptySenhaForm = {
  senhaAtual: "",
  novaSenha: "",
  confirmarSenha: "",
};

function getPermissaoLabel(value) {
  const map = {
    ADMINISTRADOR: "Administrador",
    COLABORADOR: "Colaborador",
  };
  return map[value] || value || "-";
}

export default function Configuracoes() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openPerfil, setOpenPerfil] = useState(false);
  const [openSenha, setOpenSenha] = useState(false);

  const [perfilForm, setPerfilForm] = useState(emptyPerfilForm);
  const [senhaForm, setSenhaForm] = useState(emptySenhaForm);

  const avatarLetter = useMemo(() => {
    const nome = usuario?.nome || "U";
    return String(nome).trim().charAt(0).toUpperCase();
  }, [usuario]);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getMe();
      setUsuario(data);
    } catch (e) {
      setError(e?.message || "Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  function handleOpenPerfil() {
    if (!usuario) return;

    resetMessages();
    setPerfilForm({
      nome: usuario.nome || "",
      sobrenome: usuario.sobrenome || "",
      dataNascimento: usuario.dataNascimento || "",
      login: usuario.login || "",
    });
    setOpenPerfil(true);
  }

  function handleOpenSenha() {
    resetMessages();
    setSenhaForm(emptySenhaForm);
    setOpenSenha(true);
  }

  async function handleSavePerfil() {
    try {
      resetMessages();

      const payload = {
        nome: perfilForm.nome?.trim(),
        sobrenome: perfilForm.sobrenome?.trim(),
        dataNascimento: perfilForm.dataNascimento || null,
        login: perfilForm.login?.trim(),
      };

      if (!payload.nome) {
        setError("Informe o nome.");
        return;
      }

      if (!payload.login) {
        setError("Informe o login.");
        return;
      }

      const atualizado = await apiService.updateUserProfile(payload);
      setUsuario(atualizado);
      setSuccess("Perfil atualizado com sucesso.");
      setOpenPerfil(false);
    } catch (e) {
      setError(e?.message || "Erro ao atualizar perfil.");
    }
  }

  async function handleSaveSenha() {
    try {
      resetMessages();

      const senhaAtual = senhaForm.senhaAtual?.trim();
      const novaSenha = senhaForm.novaSenha?.trim();
      const confirmarSenha = senhaForm.confirmarSenha?.trim();

      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        setError("Preencha todos os campos de senha.");
        return;
      }

      if (novaSenha.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }

      if (novaSenha !== confirmarSenha) {
        setError("A confirmação da nova senha não confere.");
        return;
      }

      await apiService.updateUserProfile({
        senha: novaSenha,
      });

      setSuccess("Senha atualizada com sucesso.");
      setOpenSenha(false);
      setSenhaForm(emptySenhaForm);
    } catch (e) {
      setError(e?.message || "Erro ao atualizar senha.");
    }
  }

  return (
    <AppLayout title="Meu Perfil">
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Configurações
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize e atualize seus dados de acesso e informações pessoais.
            </Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {loading ? (
          <Paper sx={{ p: 6 }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Carregando dados do perfil...
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <Stack spacing={3}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        fontSize: "2rem",
                        fontWeight: 800,
                        bgcolor: "primary.main",
                      }}
                    >
                      {avatarLetter}
                    </Avatar>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {[usuario?.nome, usuario?.sobrenome].filter(Boolean).join(" ")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {usuario?.login || "-"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Dados pessoais
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Nome
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {usuario?.nome || "-"}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Sobrenome
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {usuario?.sobrenome || "-"}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Data de nascimento
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {usuario?.dataNascimento || "-"}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Login
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {usuario?.login || "-"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<LockOutlinedIcon />}
                      onClick={handleOpenSenha}
                    >
                      Alterar senha
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={handleOpenPerfil}
                    >
                      Editar perfil
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Acesso
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cargo
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {usuario?.cargo || "-"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Permissão
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {getPermissaoLabel(usuario?.permissao)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Senha
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        ••••••••••••
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Alert severity="info" icon={<AdminPanelSettingsOutlinedIcon />}>
                  Alterações de cargo e permissão devem ser feitas por um administrador.
                </Alert>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Stack>

      <Dialog
        open={openPerfil}
        onClose={() => setOpenPerfil(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar perfil</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nome"
              value={perfilForm.nome}
              onChange={(e) =>
                setPerfilForm((prev) => ({ ...prev, nome: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Sobrenome"
              value={perfilForm.sobrenome}
              onChange={(e) =>
                setPerfilForm((prev) => ({ ...prev, sobrenome: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Data de nascimento"
              type="date"
              value={perfilForm.dataNascimento || ""}
              onChange={(e) =>
                setPerfilForm((prev) => ({ ...prev, dataNascimento: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Login / E-mail"
              value={perfilForm.login}
              onChange={(e) =>
                setPerfilForm((prev) => ({ ...prev, login: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPerfil(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSavePerfil}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSenha}
        onClose={() => setOpenSenha(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alterar senha</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Senha atual"
              type="password"
              value={senhaForm.senhaAtual}
              onChange={(e) =>
                setSenhaForm((prev) => ({ ...prev, senhaAtual: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Nova senha"
              type="password"
              value={senhaForm.novaSenha}
              onChange={(e) =>
                setSenhaForm((prev) => ({ ...prev, novaSenha: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Confirmar nova senha"
              type="password"
              value={senhaForm.confirmarSenha}
              onChange={(e) =>
                setSenhaForm((prev) => ({ ...prev, confirmarSenha: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSenha(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveSenha}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}