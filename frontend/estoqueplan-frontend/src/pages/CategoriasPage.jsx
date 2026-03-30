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

export default function CategoriasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [busca, setBusca] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [categoriaEdicaoId, setCategoriaEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const carregarCategorias = async (incluirInativos = mostrarInativos) => {
    try {
      setLoading(true);
      setError("");

      const data = await apiService.getCategorias({
        incluirInativos: incluirInativos,
      });

      setCategorias(data || []);
    } catch (e) {
      setError(e?.message || "Erro ao carregar categorias");
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

  const abrirCriacao = () => {
    setError("");
    setModoEdicao(false);
    setCategoriaEdicaoId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const abrirEdicao = (categoria) => {
    setError("");
    setModoEdicao(true);
    setCategoriaEdicaoId(categoria.id);
    setForm({
      nome: categoria.nome || "",
    });
    setOpenModal(true);
  };

  const fecharModal = () => {
    if (saving) return;
    setOpenModal(false);
    setModoEdicao(false);
    setCategoriaEdicaoId(null);
    setForm(emptyForm);
  };

  const salvarCategoria = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        nome: String(form.nome || "").trim(),
      };

      if (!payload.nome) {
        throw new Error("Informe o nome da categoria");
      }

      if (modoEdicao && categoriaEdicaoId) {
        await apiService.updateCategoria(categoriaEdicaoId, payload);
      } else {
        await apiService.createCategoria(payload);
      }

      fecharModal();
      await carregarCategorias(mostrarInativos);
    } catch (e) {
      setError(e?.message || "Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (categoria) => {
    try {
      setLoading(true);
      setError("");

      if (categoria?.ativo === false) {
        await apiService.ativarCategoria(categoria.id);
      } else {
        await apiService.inativarCategoria(categoria.id);
      }

      await carregarCategorias(mostrarInativos);
    } catch (e) {
      setError(e?.message || "Erro ao alterar status da categoria");
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
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Categorias</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gerencie as categorias dos produtos cadastrados no sistema.
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Buscar por nome"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={mostrarInativos}
                          onChange={(e) => setMostrarInativos(e.target.checked)}
                        />
                      }
                      label="Mostrar inativos"
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={abrirCriacao}
                      fullWidth
                      sx={{ height: "56px" }}
                    >
                      Nova Categoria
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* Tabela */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, minHeight: "65vh" }}>
            {loading ? (
              <Stack alignItems="center" py={6}>
                <CircularProgress />
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: "65vh" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>ID</b></TableCell>
                      <TableCell><b>Nome</b></TableCell>
                      <TableCell align="center"><b>Status</b></TableCell>
                      <TableCell><b>Inativado em</b></TableCell>
                      <TableCell align="center"><b>Ações</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {categoriasFiltradas.map((categoria) => (
                      <TableRow key={categoria.id} hover>
                        <TableCell>{categoria.id}</TableCell>
                        <TableCell>{categoria.nome}</TableCell>
                        <TableCell align="center">
                          {chipStatus(categoria.ativo)}
                        </TableCell>
                        <TableCell>{dateBR(categoria.inativadoEm)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar categoria">
                            <IconButton onClick={() => abrirEdicao(categoria)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {categoria?.ativo === false ? (
                            <Tooltip title="Ativar categoria">
                              <IconButton
                                color="success"
                                onClick={() => alternarStatus(categoria)}
                              >
                                <ToggleOnIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Inativar categoria">
                              <IconButton
                                color="warning"
                                onClick={() => alternarStatus(categoria)}
                              >
                                <ToggleOffIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

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

      {/* Modal criar/editar */}
      <Dialog open={openModal} onClose={fecharModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modoEdicao ? "Editar Categoria" : "Nova Categoria"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nome da categoria"
              value={form.nome}
              onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
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