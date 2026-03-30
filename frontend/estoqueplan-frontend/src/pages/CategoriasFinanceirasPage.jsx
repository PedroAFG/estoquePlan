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
  InputLabel,
  Select,
  MenuItem,
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
  tipo: "A_RECEBER",
};

export default function CategoriasFinanceirasPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [categoriaEdicaoId, setCategoriaEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiService.getCategoriasFinanceiras();
      setCategorias(data || []);
    } catch (e) {
      setError(e?.message || "Erro ao carregar categorias financeiras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const termo = String(busca || "").trim().toLowerCase();

    return (categorias || [])
      .filter((cat) => (mostrarInativos ? true : cat?.ativo !== false))
      .filter((cat) => (filtroTipo === "TODOS" ? true : cat?.tipo === filtroTipo))
      .filter((cat) => {
        if (!termo) return true;
        return String(cat.nome || "").toLowerCase().includes(termo);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [categorias, busca, mostrarInativos, filtroTipo]);

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
      tipo: categoria.tipo || "A_RECEBER",
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
        tipo: String(form.tipo || "").trim(),
      };

      if (!payload.nome) {
        throw new Error("Informe o nome da categoria financeira");
      }

      if (!payload.tipo) {
        throw new Error("Informe o tipo da categoria financeira");
      }

      if (modoEdicao && categoriaEdicaoId) {
        await apiService.updateCategoriaFinanceira(categoriaEdicaoId, payload);
      } else {
        await apiService.createCategoriaFinanceira(payload);
      }

      fecharModal();
      await carregarCategorias();
    } catch (e) {
      setError(e?.message || "Erro ao salvar categoria financeira");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (categoria) => {
    try {
      setLoading(true);
      setError("");

      if (categoria?.ativo === false) {
        await apiService.ativarCategoriaFinanceira(categoria.id);
      } else {
        await apiService.inativarCategoriaFinanceira(categoria.id);
      }

      await carregarCategorias();
    } catch (e) {
      setError(e?.message || "Erro ao alterar status da categoria financeira");
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

  const chipTipo = (tipo) => (
    <Chip
      size="small"
      label={tipo === "A_PAGAR" ? "A PAGAR" : "A RECEBER"}
      color={tipo === "A_PAGAR" ? "warning" : "success"}
      variant="outlined"
    />
  );

  return (
    <AppLayout title="Categorias Financeiras">
      <Grid container spacing={2}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Categorias Financeiras</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gerencie as categorias utilizadas no módulo financeiro.
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Buscar por nome"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        label="Tipo"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                      >
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="A_RECEBER">A RECEBER</MenuItem>
                        <MenuItem value="A_PAGAR">A PAGAR</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={3}>
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
                      <TableCell align="center"><b>Tipo</b></TableCell>
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
                        <TableCell align="center">{chipTipo(categoria.tipo)}</TableCell>
                        <TableCell align="center">
                          {chipStatus(categoria.ativo)}
                        </TableCell>
                        <TableCell>{dateBR(categoria.inativadoEm)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar categoria financeira">
                            <IconButton onClick={() => abrirEdicao(categoria)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {categoria?.ativo === false ? (
                            <Tooltip title="Ativar categoria financeira">
                              <IconButton
                                color="success"
                                onClick={() => alternarStatus(categoria)}
                              >
                                <ToggleOnIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Inativar categoria financeira">
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
                        <TableCell colSpan={6}>
                          <Typography align="center" color="text.secondary" py={3}>
                            Nenhuma categoria financeira encontrada
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
          {modoEdicao ? "Editar Categoria Financeira" : "Nova Categoria Financeira"}
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

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={form.tipo}
                onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
              >
                <MenuItem value="A_RECEBER">A RECEBER</MenuItem>
                <MenuItem value="A_PAGAR">A PAGAR</MenuItem>
              </Select>
            </FormControl>
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