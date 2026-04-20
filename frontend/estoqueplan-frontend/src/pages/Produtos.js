import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";

import {
  Grid,
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  Divider,
  Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

import apiService from "../services/api";

const emptyForm = {
  descricao: "",
  unidade: "un",
  quantidadeDisponivel: "",
  categoriaId: "",
  custo: "",
  precoVarejo: "",
  ncm: "",
  idSebrae: "",
};

const emptyFormErrors = {
  descricao: "",
  unidade: "",
  quantidadeDisponivel: "",
  categoriaId: "",
  custo: "",
  precoVarejo: "",
  ncm: "",
  idSebrae: "",
};

const emptyFilters = {
  busca: "",
  categoriaId: "",
  unidade: "",
  status: "TODOS",
};

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateTimeBR(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return "-";
  }
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [loading, setLoading] = useState(true);

  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [modalError, setModalError] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState(emptyFormErrors);

  const [incluirInativos, setIncluirInativos] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);

  const total = produtos.length;

  const pageContentSx = {
    width: "100%",
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [produtosData, categoriasData] = await Promise.all([
        apiService.getProdutos({ incluirInativos }),
        apiService.getCategorias(),
      ]);

      setProdutos(produtosData || []);
      setCategorias(categoriasData || []);
    } catch (e) {
      setPageError(e?.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incluirInativos]);

  const validateForm = () => {
    const novosErros = {
      descricao: "",
      unidade: "",
      quantidadeDisponivel: "",
      categoriaId: "",
      custo: "",
      precoVarejo: "",
      ncm: "",
      idSebrae: "",
    };

    const descricao = String(form.descricao || "").trim();
    const unidade = String(form.unidade || "").trim();
    const categoriaId = Number(form.categoriaId);

    const quantidadeRaw = String(form.quantidadeDisponivel ?? "").trim();
    const custoRaw = String(form.custo ?? "").trim();
    const precoRaw = String(form.precoVarejo ?? "").trim();

    const quantidadeDisponivel = Number(quantidadeRaw);
    const custo = Number(custoRaw);
    const precoVarejo = Number(precoRaw);

    if (!descricao) {
      novosErros.descricao = "Informe a descrição.";
    }

    if (!unidade) {
      novosErros.unidade = "Informe a unidade.";
    }

    if (!categoriaId) {
      novosErros.categoriaId = "Selecione uma categoria.";
    }

    if (quantidadeRaw === "") {
      novosErros.quantidadeDisponivel = "Informe a quantidade.";
    } else if (Number.isNaN(quantidadeDisponivel) || quantidadeDisponivel < 0) {
      novosErros.quantidadeDisponivel =
        "Informe uma quantidade válida maior ou igual a zero.";
    }

    if (custoRaw === "") {
      novosErros.custo = "Informe o custo.";
    } else if (Number.isNaN(custo) || custo < 0) {
      novosErros.custo = "Informe um custo válido maior ou igual a zero.";
    }

    if (precoRaw === "") {
      novosErros.precoVarejo = "Informe o preço.";
    } else if (Number.isNaN(precoVarejo) || precoVarejo < 0) {
      novosErros.precoVarejo = "Informe um preço válido maior ou igual a zero.";
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

  const handleCloseModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setModalError("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors(emptyFormErrors);
    setModalError("");
    setOpen(true);
  };

  const openEdit = (p) => {
    const ativo = p.ativo ?? true;

    if (!ativo) {
      setPageError("Produto inativo não pode ser editado.");
      return;
    }

    setEditing(p);
    setForm({
      descricao: p.descricao || "",
      unidade: p.unidade || "un",
      quantidadeDisponivel: p.quantidadeDisponivel ?? 0,
      categoriaId: p.categoria?.id || "",
      custo: p.custo ?? "",
      precoVarejo: p.precoVarejo ?? "",
      ncm: p.ncm || "",
      idSebrae: p.idSebrae || "",
    });
    setFormErrors(emptyFormErrors);
    setModalError("");
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      setModalError("");

      const isValid = validateForm();
      if (!isValid) return;

      const payload = {
        descricao: String(form.descricao || "").trim(),
        unidade: String(form.unidade || "un").trim(),
        quantidadeDisponivel: Number(form.quantidadeDisponivel),
        categoriaId: Number(form.categoriaId),
        custo: Number(form.custo),
        precoVarejo: Number(form.precoVarejo),
        ncm: String(form.ncm || "").trim(),
        idSebrae: String(form.idSebrae || "").trim(),
      };

      setLoading(true);

      if (editing) {
        const updated = await apiService.updateProduto(editing.id, payload);
        setProdutos((prev) =>
          prev.map((p) => (p.id === editing.id ? updated : p))
        );
        setPageSuccess("Produto atualizado com sucesso.");
      } else {
        const created = await apiService.createProduto(payload);
        setProdutos((prev) => [created, ...prev]);
        setPageSuccess("Produto criado com sucesso.");
      }

      handleCloseModal();
    } catch (e) {
      setModalError(e?.message || "Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  const handleInativar = async (p) => {
    const ok = window.confirm(
      `Inativar o produto "${p.descricao}"?\n(Ele não será excluído)`
    );
    if (!ok) return;

    try {
      setPageError("");
      setPageSuccess("");
      setLoading(true);

      await apiService.inativarProduto(p.id);
      await loadData();
      setPageSuccess("Produto inativado com sucesso.");
    } catch (e) {
      setPageError(e?.message || "Erro ao inativar produto");
    } finally {
      setLoading(false);
    }
  };

  const statusChip = (p) => {
    const ativo = p.ativo ?? true;

    return (
      <Chip
        size="small"
        label={ativo ? "ATIVO" : "INATIVO"}
        color={ativo ? "success" : "default"}
        variant={ativo ? "filled" : "outlined"}
      />
    );
  };

  const unidadesDisponiveis = useMemo(() => {
    const unicas = new Set(
      (produtos || [])
        .map((p) => String(p.unidade || "").trim())
        .filter(Boolean)
    );

    return Array.from(unicas).sort((a, b) => a.localeCompare(b));
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const busca = String(filters.busca || "").trim().toLowerCase();

    return [...produtos]
      .filter((p) => {
        if (!busca) return true;

        const texto = `
          ${p.descricao || ""}
          ${p.ncm || ""}
          ${p.idSebrae || ""}
        `.toLowerCase();

        return texto.includes(busca);
      })
      .filter((p) => {
        if (!filters.categoriaId) return true;
        return String(p.categoria?.id || "") === String(filters.categoriaId);
      })
      .filter((p) => {
        if (!filters.unidade) return true;
        return (
          String(p.unidade || "").toLowerCase() ===
          String(filters.unidade).toLowerCase()
        );
      })
      .filter((p) => {
        const ativo = p.ativo ?? true;

        if (filters.status === "ATIVOS") return ativo;
        if (filters.status === "INATIVOS") return !ativo;
        return true;
      })
      .sort((a, b) => (a.descricao || "").localeCompare(b.descricao || ""));
  }, [produtos, filters]);

  return (
    <AppLayout title="Produtos">
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
                      Produtos cadastrados
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {produtosFiltrados.length} de {total} item(ns)
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
                      onClick={openCreate}
                    >
                      Novo Produto
                    </Button>

                    <Button variant="contained">Importar</Button>
                    <Button variant="contained">Exportar XLSX</Button>
                    <Button variant="contained">Exportar PDF</Button>

                    <FormControlLabel
                      sx={{ ml: { xs: 0, lg: 1 } }}
                      control={
                        <Switch
                          checked={incluirInativos}
                          onChange={(e) => setIncluirInativos(e.target.checked)}
                        />
                      }
                      label="Incluir inativos"
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
                    md: "1fr 1fr",
                    lg: "minmax(260px, 2.2fr) minmax(220px, 1.4fr) minmax(160px, 1fr) minmax(160px, 1fr) auto",
                  },
                  gap: 2,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TextField
                  label="Buscar"
                  placeholder="Descrição, NCM ou ID Sebrae"
                  value={filters.busca}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      busca: e.target.value,
                    }))
                  }
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    label="Categoria"
                    value={filters.categoriaId}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        categoriaId: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categorias.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Unidade</InputLabel>
                  <Select
                    label="Unidade"
                    value={filters.unidade}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        unidade: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {unidadesDisponiveis.map((un) => (
                      <MenuItem key={un} value={un}>
                        {un}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="TODOS">Todos</MenuItem>
                    <MenuItem value="ATIVOS">Ativos</MenuItem>
                    <MenuItem value="INATIVOS">Inativos</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="text"
                  onClick={() => setFilters(emptyFilters)}
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
                      <TableCell><b>Descrição</b></TableCell>
                      <TableCell><b>Categoria</b></TableCell>
                      <TableCell><b>Un</b></TableCell>
                      <TableCell align="right"><b>Qtde</b></TableCell>
                      <TableCell align="right"><b>Custo</b></TableCell>
                      <TableCell align="right"><b>Preço</b></TableCell>
                      <TableCell align="center" sx={{ width: 110 }}>
                        <b>Status</b>
                      </TableCell>
                      <TableCell align="center" sx={{ width: 180 }}>
                        <b>Inativado em</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Ações</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {produtosFiltrados.map((p) => {
                      const ativo = p.ativo ?? true;

                      return (
                        <TableRow
                          key={p.id}
                          hover
                          sx={{ opacity: ativo ? 1 : 0.55 }}
                        >
                          <TableCell>{p.descricao}</TableCell>
                          <TableCell>{p.categoria?.nome || "-"}</TableCell>
                          <TableCell>{p.unidade || "-"}</TableCell>
                          <TableCell align="right">
                            {p.quantidadeDisponivel ?? 0}
                          </TableCell>
                          <TableCell align="right">{money(p.custo)}</TableCell>
                          <TableCell align="right">{money(p.precoVarejo)}</TableCell>
                          <TableCell align="center">{statusChip(p)}</TableCell>
                          <TableCell align="center">
                            {incluirInativos ? dateTimeBR(p.inativadoEm) : "-"}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={ativo ? "Editar" : "Produto inativo"}>
                              <span>
                                <IconButton
                                  onClick={() => openEdit(p)}
                                  disabled={!ativo}
                                >
                                  <EditIcon />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Inativar (não exclui)">
                              <span>
                                <IconButton
                                  color="warning"
                                  onClick={() => handleInativar(p)}
                                  disabled={!ativo}
                                >
                                  <BlockIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {produtosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Typography
                            align="center"
                            color="text.secondary"
                            py={3}
                          >
                            Nenhum produto encontrado para os filtros informados
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

      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            {modalError && (
              <Alert severity="error" onClose={() => setModalError("")}>
                {modalError}
              </Alert>
            )}

            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => updateFormField("descricao", e.target.value)}
              error={!!formErrors.descricao}
              helperText={formErrors.descricao}
              fullWidth
            />

            <FormControl fullWidth error={!!formErrors.categoriaId}>
              <InputLabel>Categoria</InputLabel>
              <Select
                label="Categoria"
                value={form.categoriaId}
                onChange={(e) => updateFormField("categoriaId", e.target.value)}
              >
                {categorias.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nome}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.categoriaId}</FormHelperText>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Unidade"
                value={form.unidade}
                onChange={(e) => updateFormField("unidade", e.target.value)}
                error={!!formErrors.unidade}
                helperText={formErrors.unidade}
                fullWidth
              />
              <TextField
                label="Quantidade"
                type="number"
                value={form.quantidadeDisponivel}
                fullWidth
                onChange={(e) =>
                  updateFormField("quantidadeDisponivel", e.target.value)
                }
                error={!!formErrors.quantidadeDisponivel}
                helperText={formErrors.quantidadeDisponivel}
                inputProps={{ min: 0 }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Custo"
                type="number"
                fullWidth
                value={form.custo}
                onChange={(e) => updateFormField("custo", e.target.value)}
                error={!!formErrors.custo}
                helperText={formErrors.custo}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Preço"
                type="number"
                fullWidth
                value={form.precoVarejo}
                onChange={(e) =>
                  updateFormField("precoVarejo", e.target.value)
                }
                error={!!formErrors.precoVarejo}
                helperText={formErrors.precoVarejo}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>

            <TextField
              label="NCM"
              value={form.ncm}
              onChange={(e) => updateFormField("ncm", e.target.value)}
              error={!!formErrors.ncm}
              helperText={formErrors.ncm}
              fullWidth
            />

            <TextField
              label="ID Sebrae"
              value={form.idSebrae}
              onChange={(e) => updateFormField("idSebrae", e.target.value)}
              error={!!formErrors.idSebrae}
              helperText={formErrors.idSebrae}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}