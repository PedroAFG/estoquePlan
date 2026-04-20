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
  FormHelperText,
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
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return "-";
  }
}

const emptyForm = {
  nome: "",
};

const emptyFormErrors = {
  nome: "",
};

export default function CategoriasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [busca, setBusca] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [categoriaEdicaoId, setCategoriaEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState(emptyFormErrors);

  const total = categorias.length;

  const pageContentSx = {
    width: "100%",
  };

  const carregarCategorias = async (incluirInativos = mostrarInativos) => {
    try {
      setLoading(true);
      setPageError("");

      const data = await apiService.getCategorias({
        incluirInativos,
      });

      setCategorias(data || []);
    } catch (e) {
      setPageError(e?.message || "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias(mostrarInativos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarInativos]);

  const categoriasFiltradas = useMemo(() => {
    const termo = String(busca || "").trim().toLowerCase();

    return (categorias || [])
      .filter((cat) => {
        if (!termo) return true;
        return String(cat.nome || "").toLowerCase().includes(termo);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [categorias, busca]);

  const validateForm = () => {
    const novosErros = {
      nome: "",
    };

    const nome = String(form.nome || "").trim();

    if (!nome) {
      novosErros.nome = "Informe o nome da categoria.";
    }

    setFormErrors(novosErros);
    return !Object.values(novosErros).some(Boolean);
  };

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
    setCategoriaEdicaoId(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setOpenModal(true);
  };

  const abrirEdicao = (categoria) => {
    const ativa = categoria?.ativo !== false;

    if (!ativa) {
      setPageError("Categoria inativa não pode ser editada.");
      return;
    }

    setPageError("");
    setModalError("");
    setModoEdicao(true);
    setCategoriaEdicaoId(categoria.id);
    setForm({
      nome: categoria.nome || "",
    });
    setFormErrors(emptyFormErrors);
    setOpenModal(true);
  };

  const fecharModal = () => {
    if (saving) return;
    setOpenModal(false);
    setModoEdicao(false);
    setCategoriaEdicaoId(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setModalError("");
  };

  const salvarCategoria = async () => {
    try {
      setSaving(true);
      setModalError("");

      const isValid = validateForm();
      if (!isValid) {
        setModalError("Revise os campos obrigatórios da categoria.");
        return;
      }

      const payload = {
        nome: String(form.nome || "").trim(),
      };

      if (modoEdicao && categoriaEdicaoId) {
        await apiService.updateCategoria(categoriaEdicaoId, payload);
        setPageSuccess("Categoria atualizada com sucesso.");
      } else {
        await apiService.createCategoria(payload);
        setPageSuccess("Categoria criada com sucesso.");
      }

      fecharModal();
      await carregarCategorias(mostrarInativos);
    } catch (e) {
      setModalError(e?.message || "Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (categoria) => {
    try {
      setLoading(true);
      setPageError("");
      setPageSuccess("");

      if (categoria?.ativo === false) {
        await apiService.ativarCategoria(categoria.id);
        setPageSuccess("Categoria ativada com sucesso.");
      } else {
        await apiService.inativarCategoria(categoria.id);
        setPageSuccess("Categoria inativada com sucesso.");
      }

      await carregarCategorias(mostrarInativos);
    } catch (e) {
      setPageError(e?.message || "Erro ao alterar status da categoria");
      setLoading(false);
    }
  };

  const chipStatus = (ativo) => (
    <Chip
      size="small"
      label={ativo === false ? "INATIVA" : "ATIVA"}
      color={ativo === false ? "warning" : "success"}
      variant="filled"
    />
  );

  return (
    <AppLayout title="Categorias">
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
                      Categorias cadastradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {categoriasFiltradas.length} de {total} item(ns)
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
                      Nova Categoria
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
                  label="Buscar por nome"
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
                      <TableCell align="center" sx={{ width: 120 }}><b>Status</b></TableCell>
                      <TableCell align="center" sx={{ width: 180 }}><b>Inativado em</b></TableCell>
                      <TableCell align="center" sx={{ width: 140 }}><b>Ações</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {categoriasFiltradas.map((categoria) => {
                      const ativa = categoria?.ativo !== false;

                      return (
                        <TableRow key={categoria.id} hover sx={{ opacity: ativa ? 1 : 0.55 }}>
                          <TableCell>{categoria.id}</TableCell>
                          <TableCell>{categoria.nome}</TableCell>
                          <TableCell align="center">
                            {chipStatus(categoria.ativo)}
                          </TableCell>
                          <TableCell align="center">
                            {mostrarInativos ? dateBR(categoria.inativadoEm) : "-"}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={ativa ? "Editar" : "Categoria inativa"}>
                              <span>
                                <IconButton onClick={() => abrirEdicao(categoria)} disabled={!ativa}>
                                  <EditIcon />
                                </IconButton>
                              </span>
                            </Tooltip>

                            {categoria?.ativo === false ? (
                              <Tooltip title="Ativar categoria">
                                <IconButton color="success" onClick={() => alternarStatus(categoria)}>
                                  <ToggleOnIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Inativar categoria">
                                <IconButton color="warning" onClick={() => alternarStatus(categoria)}>
                                  <ToggleOffIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {categoriasFiltradas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography align="center" color="text.secondary" py={3}>
                            Nenhuma categoria encontrada
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
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {modoEdicao ? "Editar Categoria" : "Nova Categoria"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            {modalError && (
              <Alert severity="error" onClose={() => setModalError("")}>
                {modalError}
              </Alert>
            )}

            <TextField
              label="Nome da categoria"
              value={form.nome}
              onChange={(e) => updateFormField("nome", e.target.value)}
              error={!!formErrors.nome}
              helperText={formErrors.nome}
              fullWidth
              autoFocus
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={fecharModal} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarCategoria} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}