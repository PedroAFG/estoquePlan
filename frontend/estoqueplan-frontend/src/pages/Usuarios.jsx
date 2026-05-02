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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tooltip,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

function dateBR(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

const emptyForm = {
  nome: "",
  sobrenome: "",
  dataNascimento: "",
  cargo: "",
  login: "",
  senha: "",
  confirmarSenha: "",
  permissao: "COLABORADOR",
  ativo: true,
};

const emptyFormErrors = {
  nome: "",
  sobrenome: "",
  dataNascimento: "",
  cargo: "",
  login: "",
  senha: "",
  confirmarSenha: "",
  permissao: "",
};

function validarLogin(login) {
  const valor = String(login || "").trim();
  if (!valor) return false;
  return valor.length >= 3;
}

function validarDataNascimento(data) {
  const valor = String(data || "").trim();
  if (!valor) return false;

  const dataInformada = new Date(`${valor}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (Number.isNaN(dataInformada.getTime())) return false;
  return dataInformada <= hoje;
}

export default function Usuarios() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const [usuarios, setUsuarios] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [busca, setBusca] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioEdicaoId, setUsuarioEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState(emptyFormErrors);

  const total = usuarios.length;

  const pageContentSx = {
    width: "100%",
  };

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await apiService.getUsuarios();
      setUsuarios(data || []);
    } catch (e) {
      setPageError(e?.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const termo = String(busca || "").trim().toLowerCase();

    return (usuarios || [])
      .filter((usuario) => (mostrarInativos ? true : usuario?.ativo !== false))
      .filter((usuario) => {
        if (!termo) return true;

        const texto = `
          ${usuario.nome || ""}
          ${usuario.sobrenome || ""}
          ${usuario.login || ""}
          ${usuario.cargo || ""}
          ${usuario.permissao || ""}
        `.toLowerCase();

        return texto.includes(termo);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [usuarios, busca, mostrarInativos]);

  const updateFormField = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [campo]: "",
    }));

    setModalError("");
    setPageSuccess("");
  };

  const abrirCriacao = () => {
    setPageError("");
    setModalError("");
    setModoEdicao(false);
    setUsuarioEdicaoId(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setOpenModal(true);
  };

  const mapearUsuarioParaForm = (usuario) => ({
    nome: usuario?.nome || "",
    sobrenome: usuario?.sobrenome || "",
    dataNascimento: usuario?.dataNascimento || "",
    cargo: usuario?.cargo || "",
    login: usuario?.login || "",
    senha: "",
    confirmarSenha: "",
    permissao: usuario?.permissao || "COLABORADOR",
    ativo: usuario?.ativo !== false,
  });

  const abrirEdicao = async (usuario) => {
    try {
      const ativo = usuario?.ativo !== false;

      if (!ativo) {
        setPageError("Usuário inativo não pode ser editado.");
        return;
      }

      setPageError("");
      setLoading(true);

      const data = await apiService.getUsuarioById(usuario.id);

      setModoEdicao(true);
      setUsuarioEdicaoId(usuario.id);
      setForm(mapearUsuarioParaForm(data));
      setFormErrors(emptyFormErrors);
      setModalError("");
      setOpenModal(true);
    } catch (e) {
      setPageError(e?.message || "Erro ao buscar dados do usuário");
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    if (saving) return;

    setOpenModal(false);
    setModoEdicao(false);
    setUsuarioEdicaoId(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setModalError("");
  };

  const validateForm = () => {
    const novosErros = {
      nome: "",
      sobrenome: "",
      dataNascimento: "",
      cargo: "",
      login: "",
      senha: "",
      confirmarSenha: "",
      permissao: "",
    };

    const nome = String(form.nome || "").trim();
    const sobrenome = String(form.sobrenome || "").trim();
    const dataNascimento = String(form.dataNascimento || "").trim();
    const cargo = String(form.cargo || "").trim();
    const login = String(form.login || "").trim();
    const senha = String(form.senha || "");
    const confirmarSenha = String(form.confirmarSenha || "");
    const permissao = String(form.permissao || "").trim();

    if (!nome) {
      novosErros.nome = "Informe o nome do usuário.";
    }

    if (!sobrenome) {
      novosErros.sobrenome = "Informe o sobrenome.";
    }

    if (!dataNascimento) {
      novosErros.dataNascimento = "Informe a data de nascimento.";
    } else if (!validarDataNascimento(dataNascimento)) {
      novosErros.dataNascimento = "Informe uma data de nascimento válida.";
    }

    if (!cargo) {
      novosErros.cargo = "Informe o cargo.";
    }

    if (!login) {
      novosErros.login = "Informe o login.";
    } else if (!validarLogin(login)) {
      novosErros.login = "Informe um login válido com pelo menos 3 caracteres.";
    }

    if (!permissao) {
      novosErros.permissao = "Informe a permissão.";
    }

    if (!modoEdicao) {
      if (!senha) {
        novosErros.senha = "Informe a senha.";
      } else if (senha.length < 6) {
        novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
      }

      if (!confirmarSenha) {
        novosErros.confirmarSenha = "Confirme a senha.";
      } else if (senha !== confirmarSenha) {
        novosErros.confirmarSenha = "As senhas não coincidem.";
      }
    } else {
      if (senha && senha.length < 6) {
        novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
      }

      if (senha || confirmarSenha) {
        if (!confirmarSenha) {
          novosErros.confirmarSenha = "Confirme a nova senha.";
        } else if (senha !== confirmarSenha) {
          novosErros.confirmarSenha = "As senhas não coincidem.";
        }
      }
    }

    setFormErrors(novosErros);
    return !Object.values(novosErros).some(Boolean);
  };

  const montarPayload = () => {
    const payload = {
      nome: String(form.nome || "").trim(),
      sobrenome: String(form.sobrenome || "").trim(),
      dataNascimento: String(form.dataNascimento || "").trim(),
      cargo: String(form.cargo || "").trim(),
      login: String(form.login || "").trim(),
      permissao: String(form.permissao || "").trim(),
      ativo: form.ativo !== false,
    };

    if (String(form.senha || "").trim()) {
      payload.senha = form.senha;
    }

    return payload;
  };

  const salvarUsuario = async () => {
    try {
      setSaving(true);
      setModalError("");

      const isValid = validateForm();
      if (!isValid) {
        setModalError("Revise os campos obrigatórios do usuário.");
        return;
      }

      const payload = montarPayload();

      if (modoEdicao && usuarioEdicaoId) {
        await apiService.updateUsuario(usuarioEdicaoId, payload);
        setPageSuccess("Usuário atualizado com sucesso.");
      } else {
        await apiService.createUsuario(payload);
        setPageSuccess("Usuário criado com sucesso.");
      }

      fecharModal();
      await carregarUsuarios();
    } catch (e) {
      setModalError(e?.message || "Erro ao salvar usuário");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (usuario) => {
    try {
      setLoading(true);
      setPageError("");
      setPageSuccess("");

      if (usuario?.ativo === false) {
        await apiService.ativarUsuario(usuario.id);
        setPageSuccess("Usuário ativado com sucesso.");
      } else {
        await apiService.inativarUsuario(usuario.id);
        setPageSuccess("Usuário inativado com sucesso.");
      }

      await carregarUsuarios();
    } catch (e) {
      setPageError(e?.message || "Erro ao alterar status do usuário");
      setLoading(false);
    }
  };

  const chipStatus = (ativo) => (
    <Chip
      size="small"
      label={ativo === false ? "INATIVO" : "ATIVO"}
      color={ativo === false ? "warning" : "success"}
      variant="filled"
    />
  );

  const chipPermissao = (permissao) => (
    <Chip
      size="small"
      label={permissao === "ADMINISTRADOR" ? "ADMIN" : "COLABORADOR"}
      color={permissao === "ADMINISTRADOR" ? "primary" : "default"}
      variant="outlined"
    />
  );

  return (
    <AppLayout title="Usuários">
      <Grid container spacing={2}>
        <Grid item xs={12} sx={pageContentSx}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Stack spacing={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} lg={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Usuários cadastrados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {usuariosFiltrados.length} de {total} item(ns)
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} lg={8}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent={{ xs: "flex-start", lg: "flex-end" }}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={abrirCriacao}
                    >
                      Novo Usuário
                    </Button>

                    <FormControlLabel
                      sx={{ ml: { xs: 0, lg: 1 } }}
                      control={
                        <Switch
                          checked={mostrarInativos}
                          onChange={(e) => setMostrarInativos(e.target.checked)}
                        />
                      }
                      label="Mostrar inativos"
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Divider />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr auto",
                    lg: "minmax(260px, 2fr) auto",
                  },
                  gap: 2,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TextField
                  label="Buscar usuário"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  fullWidth
                />

                <Button
                  variant="text"
                  onClick={() => setBusca("")}
                  sx={{
                    height: 56,
                    minWidth: 100,
                    whiteSpace: "nowrap",
                    justifySelf: { xs: "start", lg: "center" },
                  }}
                >
                  Limpar
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {pageSuccess && (
          <Grid item xs={12} sx={pageContentSx}>
            <Alert severity="success" onClose={() => setPageSuccess("")}>
              {pageSuccess}
            </Alert>
          </Grid>
        )}

        {pageError && (
          <Grid item xs={12} sx={pageContentSx}>
            <Alert severity="error" onClose={() => setPageError("")}>
              {pageError}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12} sx={pageContentSx}>
          <Paper
            sx={{
              p: 2,
              minHeight: "65vh",
              borderRadius: 3,
              width: "100%",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <Stack alignItems="center" py={6}>
                <CircularProgress />
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: "65vh", width: "100%" }}>
                <Table stickyHeader sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 80 }}><b>ID</b></TableCell>
                      <TableCell><b>Nome</b></TableCell>
                      <TableCell><b>Login</b></TableCell>
                      <TableCell><b>Cargo</b></TableCell>
                      <TableCell align="center" sx={{ width: 150 }}><b>Permissão</b></TableCell>
                      <TableCell sx={{ width: 140 }}><b>Nascimento</b></TableCell>
                      <TableCell align="center" sx={{ width: 120 }}><b>Status</b></TableCell>
                      <TableCell align="center" sx={{ width: 140 }}><b>Ações</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {usuariosFiltrados.map((usuario) => {
                      const ativo = usuario?.ativo !== false;

                      return (
                        <TableRow key={usuario.id} hover sx={{ opacity: ativo ? 1 : 0.55 }}>
                          <TableCell>{usuario.id}</TableCell>
                          <TableCell>{`${usuario.nome || ""} ${usuario.sobrenome || ""}`.trim()}</TableCell>
                          <TableCell>{usuario.login || "-"}</TableCell>
                          <TableCell>{usuario.cargo || "-"}</TableCell>
                          <TableCell align="center">
                            {chipPermissao(usuario.permissao)}
                          </TableCell>
                          <TableCell>{dateBR(usuario.dataNascimento)}</TableCell>
                          <TableCell align="center">
                            {chipStatus(usuario.ativo)}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={ativo ? "Editar" : "Usuário inativo"}>
                              <span>
                                <IconButton onClick={() => abrirEdicao(usuario)} disabled={!ativo}>
                                  <EditIcon />
                                </IconButton>
                              </span>
                            </Tooltip>

                            {usuario?.ativo === false ? (
                              <Tooltip title="Ativar usuário">
                                <IconButton
                                  color="success"
                                  onClick={() => alternarStatus(usuario)}
                                >
                                  <ToggleOnIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Inativar usuário">
                                <IconButton
                                  color="warning"
                                  onClick={() => alternarStatus(usuario)}
                                >
                                  <ToggleOffIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {usuariosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Typography align="center" color="text.secondary" py={3}>
                            Nenhum usuário encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openModal}
        onClose={fecharModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {modoEdicao ? "Editar Usuário" : "Novo Usuário"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            {modalError && (
              <Alert severity="error" onClose={() => setModalError("")}>
                {modalError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome"
                  value={form.nome}
                  onChange={(e) => updateFormField("nome", e.target.value)}
                  error={!!formErrors.nome}
                  inputProps={{ maxLength: 200 }}
                  fullWidth
                  helperText={
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <span style={{ color: formErrors.nome ? "#d32f2f" : undefined }}>
                        {formErrors.nome || "Obrigatório"}
                      </span>
                      <span>{form.nome.length}/200</span>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Sobrenome"
                  value={form.sobrenome}
                  onChange={(e) => updateFormField("sobrenome", e.target.value)}
                  error={!!formErrors.sobrenome}
                  inputProps={{ maxLength: 200 }}
                  fullWidth
                  helperText={
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <span style={{ color: formErrors.sobrenome ? "#d32f2f" : undefined }}>
                        {formErrors.sobrenome || "Obrigatório"}
                      </span>
                      <span>{form.sobrenome.length}/200</span>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Data de nascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => updateFormField("dataNascimento", e.target.value)}
                  error={!!formErrors.dataNascimento}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Cargo"
                  value={form.cargo}
                  onChange={(e) => updateFormField("cargo", e.target.value)}
                  error={!!formErrors.cargo}
                  inputProps={{ maxLength: 50 }}
                  fullWidth
                  helperText={
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <span style={{ color: formErrors.cargo ? "#d32f2f" : undefined }}>
                        {formErrors.cargo || "Obrigatório"}
                      </span>
                      <span>{form.cargo.length}/50</span>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!formErrors.permissao}>
                  <InputLabel>Permissão</InputLabel>
                  <Select
                    label="Permissão"
                    value={form.permissao}
                    onChange={(e) => updateFormField("permissao", e.target.value)}
                  >
                    <MenuItem value="COLABORADOR">Colaborador</MenuItem>
                    <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
                  </Select>
                  <FormHelperText>{formErrors.permissao}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Login"
                  value={form.login}
                  onChange={(e) => updateFormField("login", e.target.value)}
                  error={!!formErrors.login}
                  inputProps={{ maxLength: 100 }}
                  fullWidth
                  helperText={
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <span style={{ color: formErrors.login ? "#d32f2f" : undefined }}>
                        {formErrors.login || "Obrigatório"}
                      </span>
                      <span>{form.login.length}/100</span>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ height: "100%", display: "flex", alignItems: "center", pl: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.ativo}
                        onChange={(e) => updateFormField("ativo", e.target.checked)}
                      />
                    }
                    label="Usuário ativo"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label={modoEdicao ? "Nova senha" : "Senha"}
                  type="password"
                  value={form.senha}
                  onChange={(e) => updateFormField("senha", e.target.value)}
                  error={!!formErrors.senha}
                  helperText={
                    formErrors.senha ||
                    (modoEdicao ? "Preencha apenas se desejar alterar a senha." : "")
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label={modoEdicao ? "Confirmar nova senha" : "Confirmar senha"}
                  type="password"
                  value={form.confirmarSenha}
                  onChange={(e) => updateFormField("confirmarSenha", e.target.value)}
                  error={!!formErrors.confirmarSenha}
                  helperText={formErrors.confirmarSenha}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={fecharModal} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarUsuario} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}