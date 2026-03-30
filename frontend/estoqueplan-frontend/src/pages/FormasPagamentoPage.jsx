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

function percentBR(v) {
  const num = Number(v || 0);
  return `${num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

const tiposFormaPagamento = [
  "PIX",
  "DINHEIRO",
  "CARTAO_DEBITO",
  "CARTAO_CREDITO",
  "BOLETO",
  "TRANSFERENCIA",
];

const emptyForm = {
  tipo: "PIX",
  taxaPercentual: 0,
  prazoDiasRepasse: 0,
};

export default function FormasPagamentoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formas, setFormas] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formaEdicaoId, setFormaEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const carregarFormasPagamento = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiService.getFormasPagamento();
      setFormas(data || []);
    } catch (e) {
      setError(e?.message || "Erro ao carregar formas de pagamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFormasPagamento();
  }, []);

  const formasFiltradas = useMemo(() => {
    const termo = String(busca || "").trim().toLowerCase();

    return (formas || [])
      .filter((fp) => (mostrarInativos ? true : fp?.ativo !== false))
      .filter((fp) => (filtroTipo === "TODOS" ? true : fp?.tipo === filtroTipo))
      .filter((fp) => {
        if (!termo) return true;
        return String(fp.tipo || "").toLowerCase().includes(termo);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [formas, busca, mostrarInativos, filtroTipo]);

  const abrirCriacao = () => {
    setError("");
    setModoEdicao(false);
    setFormaEdicaoId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const abrirEdicao = (forma) => {
    setError("");
    setModoEdicao(true);
    setFormaEdicaoId(forma.id);
    setForm({
      tipo: forma.tipo || "PIX",
      taxaPercentual: forma.taxaPercentual ?? 0,
      prazoDiasRepasse: forma.prazoDiasRepasse ?? 0,
    });
    setOpenModal(true);
  };

  const fecharModal = () => {
    if (saving) return;
    setOpenModal(false);
    setModoEdicao(false);
    setFormaEdicaoId(null);
    setForm(emptyForm);
  };

  const salvarFormaPagamento = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        tipo: String(form.tipo || "").trim(),
        taxaPercentual: Number(form.taxaPercentual || 0),
        prazoDiasRepasse: Number(form.prazoDiasRepasse || 0),
      };

      if (!payload.tipo) {
        throw new Error("Informe o tipo da forma de pagamento");
      }

      if (payload.taxaPercentual < 0) {
        throw new Error("A taxa percentual não pode ser negativa");
      }

      if (payload.prazoDiasRepasse < 0) {
        throw new Error("O prazo de repasse não pode ser negativo");
      }

      if (modoEdicao && formaEdicaoId) {
        await apiService.updateFormaPagamento(formaEdicaoId, payload);
      } else {
        await apiService.createFormaPagamento(payload);
      }

      fecharModal();
      await carregarFormasPagamento();
    } catch (e) {
      setError(e?.message || "Erro ao salvar forma de pagamento");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (forma) => {
    try {
      setLoading(true);
      setError("");

      if (forma?.ativo === false) {
        await apiService.ativarFormaPagamento(forma.id);
      } else {
        await apiService.inativarFormaPagamento(forma.id);
      }

      await carregarFormasPagamento();
    } catch (e) {
      setError(e?.message || "Erro ao alterar status da forma de pagamento");
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
      label={String(tipo || "").replaceAll("_", " ")}
      color="primary"
      variant="outlined"
    />
  );

  return (
    <AppLayout title="Formas de Pagamento">
      <Grid container spacing={2}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Formas de Pagamento</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gerencie os meios de pagamento aceitos pelo sistema.
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Buscar por tipo"
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
                        {tiposFormaPagamento.map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo.replaceAll("_", " ")}
                          </MenuItem>
                        ))}
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
                      Nova Forma
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
                      <TableCell><b>Tipo</b></TableCell>
                      <TableCell align="right"><b>Taxa</b></TableCell>
                      <TableCell align="center"><b>Prazo repasse</b></TableCell>
                      <TableCell align="center"><b>Status</b></TableCell>
                      <TableCell><b>Inativado em</b></TableCell>
                      <TableCell align="center"><b>Ações</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {formasFiltradas.map((forma) => (
                      <TableRow key={forma.id} hover>
                        <TableCell>{forma.id}</TableCell>
                        <TableCell>{chipTipo(forma.tipo)}</TableCell>
                        <TableCell align="right">
                          {percentBR(forma.taxaPercentual)}
                        </TableCell>
                        <TableCell align="center">
                          {forma.prazoDiasRepasse ?? 0} dia(s)
                        </TableCell>
                        <TableCell align="center">
                          {chipStatus(forma.ativo)}
                        </TableCell>
                        <TableCell>{dateBR(forma.inativadoEm)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar forma de pagamento">
                            <IconButton onClick={() => abrirEdicao(forma)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {forma?.ativo === false ? (
                            <Tooltip title="Ativar forma de pagamento">
                              <IconButton
                                color="success"
                                onClick={() => alternarStatus(forma)}
                              >
                                <ToggleOnIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Inativar forma de pagamento">
                              <IconButton
                                color="warning"
                                onClick={() => alternarStatus(forma)}
                              >
                                <ToggleOffIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {formasFiltradas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography align="center" color="text.secondary" py={3}>
                            Nenhuma forma de pagamento encontrada
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
          {modoEdicao ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={form.tipo}
                onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
              >
                {tiposFormaPagamento.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo.replaceAll("_", " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Taxa percentual"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={form.taxaPercentual}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, taxaPercentual: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Prazo de repasse (dias)"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={form.prazoDiasRepasse}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, prazoDiasRepasse: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={fecharModal} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarFormaPagamento} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}