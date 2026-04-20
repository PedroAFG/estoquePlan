import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import apiService from "../services/api";
import { PatternFormat } from "react-number-format";

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

const emptyFormErrors = {
  tipo: "",
  nome: "",
  email: "",
  telefone: "",
  endereco: "",
  cpf: "",
  cnpj: "",
  capitalSocial: "",
};

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function validarEmail(email) {
  const valor = String(email || "").trim();
  if (!valor) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function validarCPF(cpf) {
  const valor = somenteNumeros(cpf);

  if (!valor || valor.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(valor)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) {
    soma += Number(valor.charAt(i)) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(valor.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) {
    soma += Number(valor.charAt(i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === Number(valor.charAt(10));
}

function validarCNPJ(cnpj) {
  const valor = somenteNumeros(cnpj);

  if (!valor || valor.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(valor)) return false;

  const calcularDigito = (base, pesos) => {
    const soma = base.split("").reduce((acc, numero, index) => {
      return acc + Number(numero) * pesos[index];
    }, 0);

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base12 = valor.slice(0, 12);
  const digito1 = calcularDigito(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const base13 = base12 + digito1;
  const digito2 = calcularDigito(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return valor === `${base12}${digito1}${digito2}`;
}

export default function ClientesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const [clientes, setClientes] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [busca, setBusca] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [clienteEdicaoId, setClienteEdicaoId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState(emptyFormErrors);

  const total = clientes.length;

  const pageContentSx = {
    width: "100%",
  };

  const carregarClientes = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await apiService.getClientes();
      setClientes(data || []);
    } catch (e) {
      setPageError(e?.message || "Erro ao carregar clientes");
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
    setClienteEdicaoId(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
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
      setPageError("");
      setLoading(true);

      const data = await apiService.getClienteById(cliente.id);

      setModoEdicao(true);
      setClienteEdicaoId(cliente.id);
      setForm(mapearTipoClienteParaForm(data));
      setFormErrors(emptyFormErrors);
      setModalError("");
      setOpenModal(true);
    } catch (e) {
      setPageError(e?.message || "Erro ao buscar dados do cliente");
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
    setFormErrors(emptyFormErrors);
    setModalError("");
  };

  const validateForm = () => {
    const novosErros = {
      tipo: "",
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      cpf: "",
      cnpj: "",
      capitalSocial: "",
    };

    const nome = String(form.nome || "").trim();
    const email = String(form.email || "").trim();
    const telefone = somenteNumeros(form.telefone);
    const endereco = String(form.endereco || "").trim();
    const cpf = somenteNumeros(form.cpf);
    const cnpj = somenteNumeros(form.cnpj);
    const capitalSocialRaw = String(form.capitalSocial ?? "").trim();

    if (!nome) {
      novosErros.nome = "Informe o nome do cliente.";
    }

    if (!email) {
      novosErros.email = "Informe o e-mail.";
    } else if (!validarEmail(email)) {
      novosErros.email = "Informe um e-mail válido.";
    }

    if (!telefone) {
      novosErros.telefone = "Informe o telefone.";
    } else if (telefone.length < 10 || telefone.length > 11) {
      novosErros.telefone = "Informe um telefone válido.";
    }

    if (!endereco) {
      novosErros.endereco = "Informe o endereço.";
    }

    if (form.tipo === "pessoaFisica") {
      if (!cpf) {
        novosErros.cpf = "Informe o CPF do cliente.";
      } else if (cpf.length !== 11 || !validarCPF(cpf)) {
        novosErros.cpf = "Informe um CPF válido.";
      }
    }

    if (form.tipo === "pessoaJuridica") {
      if (!cnpj) {
        novosErros.cnpj = "Informe o CNPJ do cliente.";
      } else if (cnpj.length !== 14 || !validarCNPJ(cnpj)) {
        novosErros.cnpj = "Informe um CNPJ válido.";
      }

      if (capitalSocialRaw !== "") {
        const capitalSocial = Number(capitalSocialRaw);
        if (Number.isNaN(capitalSocial) || capitalSocial < 0) {
          novosErros.capitalSocial = "Informe um capital social válido.";
        }
      }
    }

    setFormErrors(novosErros);

    return !Object.values(novosErros).some(Boolean);
  };

  const montarPayload = () => {
    const base = {
      nome: String(form.nome || "").trim(),
      email: String(form.email || "").trim(),
      telefone: somenteNumeros(form.telefone),
      endereco: String(form.endereco || "").trim(),
      tipo: form.tipo,
    };

    if (form.tipo === "pessoaFisica") {
      return {
        ...base,
        cpf: somenteNumeros(form.cpf),
      };
    }

    return {
      ...base,
      cnpj: somenteNumeros(form.cnpj),
      capitalSocial:
        form.capitalSocial === "" || form.capitalSocial === null
          ? null
          : Number(form.capitalSocial),
    };
  };

  const salvarCliente = async () => {
    try {
      setSaving(true);
      setModalError("");

      const isValid = validateForm();
      if (!isValid) {
        setModalError("Revise os campos obrigatórios do cliente.");
        return;
      }

      const payload = montarPayload();

      if (modoEdicao && clienteEdicaoId) {
        await apiService.updateCliente(clienteEdicaoId, payload);
        setPageSuccess("Cliente atualizado com sucesso.");
      } else {
        await apiService.createCliente(payload);
        setPageSuccess("Cliente criado com sucesso.");
      }

      fecharModal();
      await carregarClientes();
    } catch (e) {
      setModalError(e?.message || "Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  };

  const alternarStatus = async (cliente) => {
    try {
      setLoading(true);
      setPageError("");
      setPageSuccess("");

      if (cliente?.ativo === false) {
        await apiService.ativarCliente(cliente.id);
        setPageSuccess("Cliente ativado com sucesso.");
      } else {
        await apiService.inativarCliente(cliente.id);
        setPageSuccess("Cliente inativado com sucesso.");
      }

      await carregarClientes();
    } catch (e) {
      setPageError(e?.message || "Erro ao alterar status do cliente");
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
      setPageError("");
      setPageSuccess("");

      await apiService.deleteCliente(cliente.id);
      setPageSuccess("Cliente excluído com sucesso.");
      await carregarClientes();
    } catch (e) {
      setPageError(e?.message || "Erro ao excluir cliente");
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
                      Clientes cadastrados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {clientesFiltrados.length} de {total} item(ns)
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
                      Novo Cliente
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
                  label="Buscar cliente"
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
                      <TableCell sx={{ width: 100 }}><b>Tipo</b></TableCell>
                      <TableCell><b>Nome</b></TableCell>
                      <TableCell><b>E-mail</b></TableCell>
                      <TableCell><b>Telefone</b></TableCell>
                      <TableCell align="center" sx={{ width: 120 }}><b>Status</b></TableCell>
                      <TableCell align="center" sx={{ width: 180 }}><b>Inativado em</b></TableCell>
                      <TableCell align="center" sx={{ width: 160 }}><b>Ações</b></TableCell>
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
                        <TableCell align="center">
                          {mostrarInativos ? dateBR(cliente.inativadoEm) : "-"}
                        </TableCell>
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

      <Dialog
        open={openModal}
        onClose={fecharModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {modoEdicao ? "Editar Cliente" : "Novo Cliente"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            {modalError && (
              <Alert severity="error" onClose={() => setModalError("")}>
                {modalError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!formErrors.tipo}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={form.tipo}
                    onChange={(e) => {
                      const novoTipo = e.target.value;

                      setForm((prev) => ({
                        ...prev,
                        tipo: novoTipo,
                        cpf: "",
                        cnpj: "",
                        capitalSocial: "",
                      }));

                      setFormErrors((prev) => ({
                        ...prev,
                        tipo: "",
                        cpf: "",
                        cnpj: "",
                        capitalSocial: "",
                      }));

                      setModalError("");
                    }}
                    disabled={modoEdicao}
                  >
                    <MenuItem value="pessoaFisica">Pessoa Física</MenuItem>
                    <MenuItem value="pessoaJuridica">Pessoa Jurídica</MenuItem>
                  </Select>
                  <FormHelperText>{formErrors.tipo}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  label="Nome"
                  value={form.nome}
                  onChange={(e) => updateFormField("nome", e.target.value)}
                  error={!!formErrors.nome}
                  helperText={formErrors.nome}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="E-mail"
                  value={form.email}
                  onChange={(e) => updateFormField("email", e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <PatternFormat
                  format="(##) #####-####"
                  allowEmptyFormatting={false}
                  mask="_"
                  customInput={TextField}
                  label="Telefone"
                  value={form.telefone}
                  onValueChange={(values) => {
                    updateFormField("telefone", values.formattedValue);
                  }}
                  error={!!formErrors.telefone}
                  helperText={formErrors.telefone}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Endereço"
                  value={form.endereco}
                  onChange={(e) => updateFormField("endereco", e.target.value)}
                  error={!!formErrors.endereco}
                  helperText={formErrors.endereco}
                  fullWidth
                />
              </Grid>

              {form.tipo === "pessoaFisica" ? (
                <Grid item xs={12} md={6}>
                  <PatternFormat
                    format="###.###.###-##"
                    allowEmptyFormatting={false}
                    mask="_"
                    customInput={TextField}
                    label="CPF"
                    value={form.cpf}
                    onValueChange={(values) => {
                      updateFormField("cpf", values.formattedValue);
                    }}
                    error={!!formErrors.cpf}
                    helperText={formErrors.cpf}
                    fullWidth
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <PatternFormat
                      format="##.###.###/####-##"
                      allowEmptyFormatting={false}
                      mask="_"
                      customInput={TextField}
                      label="CNPJ"
                      value={form.cnpj}
                      onValueChange={(values) => {
                        updateFormField("cnpj", values.formattedValue);
                      }}
                      error={!!formErrors.cnpj}
                      helperText={formErrors.cnpj}
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
                        updateFormField("capitalSocial", e.target.value)
                      }
                      error={!!formErrors.capitalSocial}
                      helperText={formErrors.capitalSocial}
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