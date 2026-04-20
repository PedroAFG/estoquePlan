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
  taxaPercentual: "",
  prazoDiasRepasse: "",
};

const emptyFormErrors = {
  tipo: "",
  taxaPercentual: "",
  prazoDiasRepasse: "",
};

export default function FormasPagamentoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const [formas, setFormas] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formaEdicaoId, setFormaEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState(emptyFormErrors);

  const total = formas.length;

  const pageContentSx = {
    width: "100%",
  };

  const carregarFormasPagamento = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await apiService.getFormasPagamento({
        incluirInativos: mostrarInativos,
      });

      setFormas(data || []);
    } catch (e) {
      setPageError(e?.message || "Erro ao carregar formas de pagamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFormasPagamento();
  }, [mostrarInativos]);

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

  const validateForm = () => {
    const novosErros = {
      tipo: "",
      taxaPercentual: "",
      prazoDiasRepasse: "",
    };

    const tipo = String(form.tipo || "").trim();
    const taxaRaw = String(form.taxaPercentual ?? "").trim();
    const prazoRaw = String(form.prazoDiasRepasse ?? "").trim();

    const taxa = Number(taxaRaw);
    const prazo = Number(prazoRaw);

    if (!tipo) {
      novosErros.tipo = "Informe o tipo da forma de pagamento.";
    }

    if (taxaRaw === "") {
      novosErros.taxaPercentual = "Informe a taxa percentual.";
    } else if (Number.isNaN(taxa) || taxa < 0) {
      novosErros.taxaPercentual =
        "Informe uma taxa percentual válida maior ou igual a zero.";
    }

    if (prazoRaw === "") {
      novosErros.prazoDiasRepasse = "Informe o prazo de repasse.";
    } else if (Number.isNaN(prazo) || prazo < 0) {
      novosErros.prazoDiasRepasse =
        "Informe um prazo de repasse válido maior ou igual a zero.";
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
    setFormaEdicaoId(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setOpenModal(true);
  };

  const abrirEdicao = (forma) => {
    const ativo = forma?.ativo ?? true;

    if (!ativo) {
      setPageError("Forma de pagamento inativa não pode ser editada.");
      return;
    }

    setPageError("");
    setModalError("");
    setModoEdicao(true);
    setFormaEdicaoId(forma.id);
    setForm({
      tipo: forma.tipo || "PIX",
      taxaPercentual: forma.taxaPercentual ?? 0,
      prazoDiasRepasse: forma.prazoDiasRepasse ?? 0,
    });
    setFormErrors(emptyFormErrors);
    setOpenModal(true);
  };

  const fecharModal = () => {
    if (saving) return;

    setOpenModal(false);
    setModoEdicao(false);
    setFormaEdicaoId(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setModalError("");
  };

  const salvarFormaPagamento = async () => {
    try {
      setSaving(true);
      setModalError("");

      const isValid = validateForm();
      if (!isValid) {
        setModalError("Revise os campos obrigatórios da forma de pagamento.");
        return;
      }

      const payload = {
        tipo: String(form.tipo || "").trim(),
        taxaPercentual: Number(form.taxaPercentual),
        prazoDiasRepasse: Number(form.prazoDiasRepasse),
      };

      if (modoEdicao && formaEdicaoId) {
        await apiService.updateFormaPagamento(formaEdicaoId, payload);
        setPageSuccess("Forma de pagamento atualizada com sucesso.");
      } else {
        await apiService.createFormaPagamento(payload);
        setPageSuccess("Forma de pagamento criada com sucesso.");
      }

      fecharModal();
      await carregarFormasPagamento();
    } catch (e) {
      setModalError(e?.message || "Erro ao salvar forma de pagamento");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (forma) => {
    try {
      setLoading(true);
      setPageError("");
      setPageSuccess("");

      if (forma?.ativo === false) {
        await apiService.ativarFormaPagamento(forma.id);
        setPageSuccess("Forma de pagamento ativada com sucesso.");
      } else {
        await apiService.inativarFormaPagamento(forma.id);
        setPageSuccess("Forma de pagamento inativada com sucesso.");
      }

      await carregarFormasPagamento();
    } catch (e) {
      setPageError(e?.message || "Erro ao alterar status da forma de pagamento");
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
                      Formas de pagamento cadastradas
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {formasFiltradas.length} de {total} item(ns)
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
                      Nova Forma
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
                    md: "1fr 1fr 1fr auto",
                    lg: "minmax(260px, 2fr) minmax(220px, 1.2fr) minmax(180px, 1fr) auto",
                  },
                  gap: 2,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TextField
                  label="Buscar por tipo"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  fullWidth
                />

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

                <Box />

                <Button
                  variant="text"
                  onClick={() => {
                    setBusca("");
                    setFiltroTipo("TODOS");
                  }}
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
              <TableContainer
                sx={{
                  maxHeight: "65vh",
                  width: "100%",
                }}
              >
                <Table stickyHeader sx={{ width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 80 }}><b>ID</b></TableCell>
                      <TableCell><b>Tipo</b></TableCell>
                      <TableCell align="right"><b>Taxa</b></TableCell>
                      <TableCell align="center"><b>Prazo repasse</b></TableCell>
                      <TableCell align="center" sx={{ width: 120 }}>
                        <b>Status</b>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 180 }}>
                        <b>Inativado em</b>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 140 }}>
                        <b>Ações</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {formasFiltradas.map((forma) => {
                      const ativa = forma?.ativo !== false;

                      return (
                        <TableRow
                          key={forma.id}
                          hover
                          sx={{ opacity: ativa ? 1 : 0.55 }}
                        >
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
                          <TableCell align="center">
                            {mostrarInativos ? dateBR(forma.inativadoEm) : "-"}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={ativa ? "Editar" : "Forma inativa"}>
                              <span>
                                <IconButton
                                  onClick={() => abrirEdicao(forma)}
                                  disabled={!ativa}
                                >
                                  <EditIcon />
                                </IconButton>
                              </span>
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
                      );
                    })}

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

      <Dialog
        open={openModal}
        onClose={fecharModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {modoEdicao ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            {modalError && (
              <Alert severity="error" onClose={() => setModalError("")}>
                {modalError}
              </Alert>
            )}

            <FormControl fullWidth error={!!formErrors.tipo}>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={form.tipo}
                onChange={(e) => updateFormField("tipo", e.target.value)}
              >
                {tiposFormaPagamento.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo.replaceAll("_", " ")}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.tipo}</FormHelperText>
            </FormControl>

            <TextField
              label="Taxa percentual"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={form.taxaPercentual}
              onChange={(e) =>
                updateFormField("taxaPercentual", e.target.value)
              }
              error={!!formErrors.taxaPercentual}
              helperText={formErrors.taxaPercentual}
              fullWidth
            />

            <TextField
              label="Prazo de repasse (dias)"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={form.prazoDiasRepasse}
              onChange={(e) =>
                updateFormField("prazoDiasRepasse", e.target.value)
              }
              error={!!formErrors.prazoDiasRepasse}
              helperText={formErrors.prazoDiasRepasse}
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