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
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

import apiService from "../services/api";

const emptyForm = {
  descricao: "",
  unidade: "un",
  quantidadeDisponivel: 0,
  categoriaId: "",
  custo: "",
  precoVarejo: "",
  ncm: "",
  idSebrae: "",
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
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [incluirInativos, setIncluirInativos] = useState(false);

  const total = produtos.length;

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [produtosData, categoriasData] = await Promise.all([
        apiService.getProdutos({ incluirInativos }),
        apiService.getCategorias(),
      ]);

      setProdutos(produtosData || []);
      setCategorias(categoriasData || []);
    } catch (e) {
      setError(e?.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incluirInativos]);

  const handleCloseModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p) => {
    const ativo = p.ativo ?? true;
    if (!ativo) {
      setError("Produto inativo não pode ser editado.");
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
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      setError("");

      const payload = {
        descricao: String(form.descricao || "").trim(),
        unidade: String(form.unidade || "un").trim(),
        quantidadeDisponivel: Number(form.quantidadeDisponivel || 0),
        categoriaId: Number(form.categoriaId),
        custo: Number(form.custo || 0),
        precoVarejo: Number(form.precoVarejo || 0),
        ncm: String(form.ncm || "").trim(),
        idSebrae: String(form.idSebrae || "").trim(),
      };

      if (!payload.descricao) throw new Error("Descrição é obrigatória");
      if (!payload.categoriaId) throw new Error("Selecione uma categoria");
      if (Number.isNaN(payload.custo)) throw new Error("Custo inválido");
      if (Number.isNaN(payload.precoVarejo)) throw new Error("Preço inválido");
      if (payload.quantidadeDisponivel < 0) throw new Error("Quantidade não pode ser negativa");

      setLoading(true);

      if (editing) {
        const updated = await apiService.updateProduto(editing.id, payload);
        setProdutos((prev) =>
          prev.map((p) => (p.id === editing.id ? updated : p))
        );
      } else {
        const created = await apiService.createProduto(payload);
        setProdutos((prev) => [created, ...prev]);
      }

      handleCloseModal();
    } catch (e) {
      setError(e?.message || "Erro ao salvar produto");
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
      setError("");
      setLoading(true);

      // PATCH retorna 204 (sem body)
      await apiService.inativarProduto(p.id);

      // recarrega lista
      await loadData();
    } catch (e) {
      setError(e?.message || "Erro ao inativar produto");
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

  const produtosOrdenados = useMemo(() => {
    const list = [...produtos];
    list.sort((a, b) => (a.descricao || "").localeCompare(b.descricao || ""));
    return list;
  }, [produtos]);

  return (
    <AppLayout title="Produtos">
      <Grid container spacing={2}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Lado esquerdo */}
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Typography variant="h6">Produtos cadastrados</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {total} item(ns)
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                    sx={{ width: "fit-content" }}
                  >
                    Novo Produto
                  </Button>

                  <FormControlLabel
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

              {/* Lado direito */}
              <Grid item xs={12} md={6}>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                >
                  <Button variant="outlined">Importar</Button>
                  <Button variant="outlined">Exportar XLSX</Button>
                  <Button variant="outlined">Exportar PDF</Button>
                </Stack>
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
                      <TableCell>
                        <b>Descrição</b>
                      </TableCell>
                      <TableCell>
                        <b>Categoria</b>
                      </TableCell>
                      <TableCell>
                        <b>Un</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Qtde</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Custo</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Preço</b>
                      </TableCell>

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
                    {produtosOrdenados.map((p) => {
                      const ativo = p.ativo ?? true;

                      return (
                        <TableRow
                          key={p.id}
                          hover
                          sx={{
                            opacity: ativo ? 1 : 0.55,
                          }}
                        >
                          <TableCell>{p.descricao}</TableCell>
                          <TableCell>{p.categoria?.nome || "-"}</TableCell>
                          <TableCell>{p.unidade || "-"}</TableCell>
                          <TableCell align="right">
                            {p.quantidadeDisponivel ?? 0}
                          </TableCell>
                          <TableCell align="right">{money(p.custo)}</TableCell>
                          <TableCell align="right">{money(p.precoVarejo)}</TableCell>

                          <TableCell align="center">
                            {statusChip(p)}
                          </TableCell>

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

                    {produtosOrdenados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={incluirInativos ? 9 : 7}>
                          <Typography
                            align="center"
                            color="text.secondary"
                            py={3}
                          >
                            Nenhum produto encontrado
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

      {/* Modal */}
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                label="Categoria"
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              >
                {categorias.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Unidade"
                value={form.unidade}
                onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                fullWidth
              />
              <TextField
                label="Quantidade"
                type="number"
                value={form.quantidadeDisponivel}
                fullWidth
                onChange={(e) =>
                  setForm({ ...form, quantidadeDisponivel: e.target.value })
                }
                inputProps={{ min: 0 }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Custo"
                type="number"
                fullWidth
                value={form.custo}
                onChange={(e) => setForm({ ...form, custo: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Preço"
                type="number"
                fullWidth
                value={form.precoVarejo}
                onChange={(e) =>
                  setForm({ ...form, precoVarejo: e.target.value })
                }
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>

            <TextField
              label="NCM"
              value={form.ncm}
              onChange={(e) => setForm({ ...form, ncm: e.target.value })}
              fullWidth
            />

            <TextField
              label="ID Sebrae"
              value={form.idSebrae}
              onChange={(e) => setForm({ ...form, idSebrae: e.target.value })}
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
