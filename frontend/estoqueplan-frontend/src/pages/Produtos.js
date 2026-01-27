import React, { useEffect, useState } from "react";
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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [produtosData, categoriasData] = await Promise.all([
        apiService.getProdutos(),
        apiService.getCategorias(),
      ]);

      setProdutos(produtosData || []);
      setCategorias(categoriasData || []);
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      descricao: p.descricao,
      unidade: p.unidade,
      quantidadeDisponivel: p.quantidadeDisponivel,
      categoriaId: p.categoria?.id || "",
      custo: p.custo,
      precoVarejo: p.precoVarejo,
      ncm: p.ncm || "",
      idSebrae: p.idSebrae || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      setError("");

      const payload = {
        descricao: form.descricao,
        unidade: form.unidade,
        quantidadeDisponivel: Number(form.quantidadeDisponivel),
        categoriaId: Number(form.categoriaId),
        custo: Number(form.custo),
        precoVarejo: Number(form.precoVarejo),
        ncm: form.ncm,
        idSebrae: form.idSebrae,
      };

      if (editing) {
        const updated = await apiService.updateProduto(editing.id, payload);
        setProdutos((prev) =>
          prev.map((p) => (p.id === editing.id ? updated : p))
        );
      } else {
        const created = await apiService.createProduto(payload);
        setProdutos((prev) => [...prev, created]);
      }

      setOpen(false);
    } catch {
      setError("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir este produto?")) return;

    try {
      await apiService.deleteProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Erro ao excluir produto");
    }
  };

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
                    {produtos.length} item(ns)
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                    sx={{ width: "fit-content" }}
                  >
                    Novo Produto
                  </Button>
                </Stack>
              </Grid>

              {/* Lado direito */}
              <Grid item xs={12} md={6}>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                >
                  <Button variant="outlined">
                    Exportar XLSX
                  </Button>

                  <Button variant="outlined">
                    Exportar PDF
                  </Button>
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
          <Paper sx={{ p: 2 }}>
            {loading ? (
              <Stack alignItems="center" py={6}>
                <CircularProgress />
              </Stack>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Descrição</b></TableCell>
                      <TableCell><b>Categoria</b></TableCell>
                      <TableCell><b>Un</b></TableCell>
                      <TableCell align="right"><b>Qtd</b></TableCell>
                      <TableCell align="right"><b>Custo</b></TableCell>
                      <TableCell align="right"><b>Preço</b></TableCell>
                      <TableCell align="center"><b>Ações</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {produtos.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.descricao}</TableCell>
                        <TableCell>{p.categoria?.nome}</TableCell>
                        <TableCell>{p.unidade}</TableCell>
                        <TableCell align="right">{p.quantidadeDisponivel}</TableCell>
                        <TableCell align="right">
                          {p.custo.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {p.precoVarejo.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => openEdit(p)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(p.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

      </Grid>

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? "Editar Produto" : "Novo Produto"}
        </DialogTitle>

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
              <TextField label="Unidade" value={form.unidade} fullWidth />
              <TextField
                label="Quantidade"
                type="number"
                value={form.quantidadeDisponivel}
                fullWidth
                onChange={(e) =>
                  setForm({ ...form, quantidadeDisponivel: e.target.value })
                }
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Custo"
                type="number"
                fullWidth
                value={form.custo}
                onChange={(e) => setForm({ ...form, custo: e.target.value })}
              />
              <TextField
                label="Preço"
                type="number"
                fullWidth
                value={form.precoVarejo}
                onChange={(e) => setForm({ ...form, precoVarejo: e.target.value })}
              />
            </Stack>

            <TextField label="NCM" value={form.ncm} fullWidth />
            <TextField label="ID Sebrae" value={form.idSebrae} fullWidth />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
