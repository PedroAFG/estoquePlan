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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
  tipo: "pessoaFisica",
  nome: "",
  email: "",
  telefone: "",
  endereco: "",
  cpf: "",
  cnpj: "",
  capitalSocial: "",
};

export default function ClientesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [clientes, setClientes] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [busca, setBusca] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [clienteEdicaoId, setClienteEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiService.getClientes();
      setClientes(data || []);
    } catch (e) {
      setError(e?.message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termo = String(busca || "").trim().toLowerCase();

    return (clientes || [])
      .filter((cli) => (mostrarInativos ? true : cli?.ativo !== false))
      .filter((cli) => {
        if (!termo) return true;

        const texto = `
          ${cli.nome || ""}
          ${cli.email || ""}
          ${cli.telefone || ""}
          ${cli.cpf || ""}
          ${cli.cnpj || ""}
        `.toLowerCase();

        return texto.includes(termo);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [clientes, busca, mostrarInativos]);

  const abrirCriacao = () => {
    setError("");
    setModoEdicao(false);
    setClienteEdicaoId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const mapearTipoClienteParaForm = (cliente) => {
    const tipoNormalizado =
      cliente?.tipo === "pessoaJuridica" || cliente?.cnpj
        ? "pessoaJuridica"
        : "pessoaFisica";

    return {
      tipo: tipoNormalizado,
      nome: cliente?.nome || "",
      email: cliente?.email || "",
      telefone: cliente?.telefone || "",
      endereco: cliente?.endereco || "",
      cpf: cliente?.cpf || "",
      cnpj: cliente?.cnpj || "",
      capitalSocial: cliente?.capitalSocial ?? "",
    };
  };

  const abrirEdicao = async (cliente) => {
    try {
      setError("");
      setLoading(true);

      const data = await apiService.getClienteById(cliente.id);

      setModoEdicao(true);
      setClienteEdicaoId(cliente.id);
      setForm(mapearTipoClienteParaForm(data));
      setOpenModal(true);
    } catch (e) {
      setError(e?.message || "Erro ao buscar dados do cliente");
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    if (saving) return;
    setOpenModal(false);
    setModoEdicao(false);
    setClienteEdicaoId(null);
    setForm(emptyForm);
  };

  const montarPayload = () => {
    const base = {
      nome: String(form.nome || "").trim(),
      email: String(form.email || "").trim(),
      telefone: String(form.telefone || "").trim(),
      endereco: String(form.endereco || "").trim(),
      tipo: form.tipo,
    };

    if (!base.nome) {
      throw new Error("Informe o nome do cliente");
    }

    if (form.tipo === "pessoaFisica") {
      const cpf = String(form.cpf || "").trim();

      if (!cpf) {
        throw new Error("Informe o CPF do cliente");
      }

      return {
        ...base,
        cpf,
      };
    }

    const cnpj = String(form.cnpj || "").trim();

    if (!cnpj) {
      throw new Error("Informe o CNPJ do cliente");
    }

    return {
      ...base,
      cnpj,
      capitalSocial:
        form.capitalSocial === "" || form.capitalSocial === null
          ? null
          : Number(form.capitalSocial),
    };
  };

  const salvarCliente = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = montarPayload();

      if (modoEdicao && clienteEdicaoId) {
        await apiService.updateCliente(clienteEdicaoId, payload);
      } else {
        await apiService.createCliente(payload);
      }

      fecharModal();
      await carregarClientes();
    } catch (e) {
      setError(e?.message || "Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (cliente) => {
    try {
      setLoading(true);
      setError("");

      if (cliente?.ativo === false) {
        await apiService.ativarCliente(cliente.id);
      } else {
        await apiService.inativarCliente(cliente.id);
      }

      
      await carregarClientes();
    } catch (e) {
      setError(e?.message || "Erro ao alterar status do cliente");
      setLoading(false);
    }
  };

  const excluirCliente = async (cliente) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o cliente "${cliente.nome}"?`
    );

    if (!confirmou) return;

    try {
      setLoading(true);
      setError("");

      await apiService.deleteCliente(cliente.id);
      await carregarClientes();
    } catch (e) {
      setError(e?.message || "Erro ao excluir cliente");
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

  const chipTipo = (tipo, cliente) => {
    const tipoExibicao =
      tipo === "pessoaJuridica" || cliente?.cnpj ? "PJ" : "PF";

    return (
      <Chip
        size="small"
        label={tipoExibicao}
        color={tipoExibicao === "PJ" ? "primary" : "secondary"}
        variant="outlined"
      />
    );
  };

  return (
    <AppLayout title="Clientes">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Clientes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gerencie os clientes pessoas físicas e jurídicas do sistema.
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Buscar cliente"
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
                      Novo Cliente
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
                      <TableCell><b>Nome</b></TableCell>
                      <TableCell><b>E-mail</b></TableCell>
                      <TableCell><b>Telefone</b></TableCell>
                      <TableCell align="center"><b>Status</b></TableCell>
                      <TableCell><b>Inativado em</b></TableCell>
                      <TableCell align="center"><b>Ações</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {clientesFiltrados.map((cliente) => (
                      <TableRow key={cliente.id} hover>
                        <TableCell>{cliente.id}</TableCell>
                        <TableCell>{chipTipo(cliente.tipo, cliente)}</TableCell>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell>{cliente.email || "-"}</TableCell>
                        <TableCell>{cliente.telefone || "-"}</TableCell>
                        <TableCell align="center">
                          {chipStatus(cliente.ativo)}
                        </TableCell>
                        <TableCell>{dateBR(cliente.inativadoEm)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar cliente">
                            <IconButton onClick={() => abrirEdicao(cliente)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {cliente?.ativo === false ? (
                            <Tooltip title="Ativar cliente">
                              <IconButton
                                color="success"
                                onClick={() => alternarStatus(cliente)}
                              >
                                <ToggleOnIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Inativar cliente">
                              <IconButton
                                color="warning"
                                onClick={() => alternarStatus(cliente)}
                              >
                                <ToggleOffIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Excluir cliente">
                            <IconButton
                              color="error"
                              onClick={() => excluirCliente(cliente)}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}

                    {clientesFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Typography align="center" color="text.secondary" py={3}>
                            Nenhum cliente encontrado
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

      <Dialog open={openModal} onClose={fecharModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {modoEdicao ? "Editar Cliente" : "Novo Cliente"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        tipo: e.target.value,
                        cpf: "",
                        cnpj: "",
                        capitalSocial: "",
                      }))
                    }
                    disabled={modoEdicao}
                  >
                    <MenuItem value="pessoaFisica">Pessoa Física</MenuItem>
                    <MenuItem value="pessoaJuridica">Pessoa Jurídica</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  label="Nome"
                  value={form.nome}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="E-mail"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Telefone"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Endereço"
                  value={form.endereco}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endereco: e.target.value }))
                  }
                  fullWidth
                />
              </Grid>

              {form.tipo === "pessoaFisica" ? (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="CPF"
                    value={form.cpf}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, cpf: e.target.value }))
                    }
                    fullWidth
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="CNPJ"
                      value={form.cnpj}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, cnpj: e.target.value }))
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Capital Social"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={form.capitalSocial}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          capitalSocial: e.target.value,
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={fecharModal} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvarCliente} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}