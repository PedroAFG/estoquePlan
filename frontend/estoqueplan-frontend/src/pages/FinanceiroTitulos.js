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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentsIcon from "@mui/icons-material/Payments";

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dateBR(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return "-";
  }
}
function dateOnlyBR(yyyyMMdd) {
  if (!yyyyMMdd) return "-";
  try {
    const [y, m, d] = String(yyyyMMdd).split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return "-";
  }
}

const emptyCreate = {
  tipo: "A_RECEBER",
  descricao: "",
  valorTotal: "",
  categoriaId: "",
  formaPagamentoId: "",
  numeroParcelas: 1,
  primeiroVencimento: "",
  intervaloDias: 30,
};

const emptyBaixa = {
  dataBaixa: "",
  descricao: "",
};

export default function FinanceiroTitulos() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [titulos, setTitulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);

  // filtros
  const [fTipo, setFTipo] = useState("TODOS");
  const [fStatus, setFStatus] = useState("TODOS");
  const [fBusca, setFBusca] = useState("");

  // modal criar
  const [openCreate, setOpenCreate] = useState(false);
  const [formCreate, setFormCreate] = useState(emptyCreate);

  // modal detalhes
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState(null);

  // modal baixar parcela
  const [openBaixa, setOpenBaixa] = useState(false);
  const [baixaTarget, setBaixaTarget] = useState(null); // { tituloId, parcelaId }
  const [formBaixa, setFormBaixa] = useState(emptyBaixa);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [titulosData, catData, fpData] = await Promise.all([
        apiService.getTitulosFinanceiros(),
        apiService.getCategoriasFinanceiras(),
        apiService.getFormasPagamento(),
      ]);

      setTitulos(titulosData || []);
      setCategorias(catData || []);
      setFormasPagamento(fpData || []);
    } catch (e) {
      setError(e?.message || "Erro ao carregar financeiro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chipTipo = (tipo) => (
    <Chip
      size="small"
      label={tipo}
      color={tipo === "A_RECEBER" ? "success" : "warning"}
      variant="filled"
    />
  );

  const chipStatus = (st) => {
    const map = {
      PENDENTE: "default",
      ATRASADO: "warning",
      PAGO_RECEBIDO: "success",
      CANCELADO: "default",
    };
    return (
      <Chip size="small" label={st} color={map[st] || "default"} variant={st === "CANCELADO" ? "outlined" : "filled"} />
    );
  };

  // filtros em memória
  const titulosFiltrados = useMemo(() => {
    const b = String(fBusca || "").trim().toLowerCase();
    return (titulos || [])
      .filter((t) => (fTipo === "TODOS" ? true : t.tipo === fTipo))
      .filter((t) => (fStatus === "TODOS" ? true : t.status === fStatus))
      .filter((t) => {
        if (!b) return true;
        const s = `${t.descricao || ""} ${t.categoriaNome || ""}`.toLowerCase();
        return s.includes(b);
      })
      .sort((a, b2) => Number(b2.id) - Number(a.id));
  }, [titulos, fTipo, fStatus, fBusca]);

  const openDetalhes = async (id) => {
    try {
      setError("");
      setLoading(true);
      const data = await apiService.getTituloFinanceiroById(id);
      setDetail(data);
      setOpenDetail(true);
    } catch (e) {
      setError(e?.message || "Erro ao abrir detalhes");
    } finally {
      setLoading(false);
    }
  };

  const closeDetalhes = () => {
    setOpenDetail(false);
    setDetail(null);
  };

  const handleOpenCreate = () => {
    setError("");
    setFormCreate(emptyCreate);
    setOpenCreate(true);
  };

  const closeCreate = () => {
    setOpenCreate(false);
    setFormCreate(emptyCreate);
  };

  const categoriasDoTipo = useMemo(() => {
    const tipo = formCreate.tipo;
    return (categorias || []).filter((c) => (c.ativo ?? true) === true && c.tipo === tipo);
  }, [categorias, formCreate.tipo]);

  const handleCreate = async () => {
    try {
      setError("");

      const payload = {
        tipo: formCreate.tipo,
        descricao: String(formCreate.descricao || "").trim(),
        valorTotal: Number(formCreate.valorTotal || 0),
        categoriaId: Number(formCreate.categoriaId),
        formaPagamentoId: Number(formCreate.formaPagamentoId),
        numeroParcelas: Number(formCreate.numeroParcelas || 1),
        primeiroVencimento: String(formCreate.primeiroVencimento || "").trim(),
        intervaloDias: Number(formCreate.intervaloDias || 30),
      };

      if (!payload.descricao) throw new Error("Descrição é obrigatória");
      if (!payload.valorTotal || payload.valorTotal <= 0) throw new Error("Valor total inválido");
      if (!payload.categoriaId) throw new Error("Selecione uma categoria financeira");
      if (!payload.formaPagamentoId) throw new Error("Selecione a forma de pagamento");
      if (!payload.primeiroVencimento) throw new Error("Informe o primeiro vencimento (YYYY-MM-DD)");
      if (payload.numeroParcelas < 1) throw new Error("Número de parcelas inválido");
      if (payload.intervaloDias < 1) throw new Error("Intervalo de dias inválido");

      setLoading(true);
      const created = await apiService.createTituloFinanceiro(payload);
      setTitulos((prev) => [created, ...(prev || [])]);

      closeCreate();
    } catch (e) {
      setError(e?.message || "Erro ao criar título");
    } finally {
      setLoading(false);
    }
  };

  const canBaixar = (p) => p?.status === "PENDENTE" || p?.status === "ATRASADO";

  const openBaixar = (tituloId, parcelaId) => {
    setError("");
    setBaixaTarget({ tituloId, parcelaId });
    setFormBaixa({
      dataBaixa: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      descricao: "",
    });
    setOpenBaixa(true);
  };

  const closeBaixar = () => {
    setOpenBaixa(false);
    setBaixaTarget(null);
    setFormBaixa(emptyBaixa);
  };

  const handleBaixar = async () => {
    try {
      if (!baixaTarget?.parcelaId) return;
      setError("");

      const payload = {
        dataBaixa: String(formBaixa.dataBaixa || "").trim(),
        descricao: String(formBaixa.descricao || "").trim(),
      };

      // body é opcional, mas se mandar, manda certinho
      const body = {};
      if (payload.dataBaixa) body.dataBaixa = payload.dataBaixa;
      if (payload.descricao) body.descricao = payload.descricao;

      setLoading(true);
      await apiService.baixarParcela(baixaTarget.parcelaId, body);

      // recarrega detalhes do título
      const updated = await apiService.getTituloFinanceiroById(baixaTarget.tituloId);
      setDetail(updated);

      // recarrega lista (pra status atualizar certinho)
      const all = await apiService.getTitulosFinanceiros();
      setTitulos(all || []);

      closeBaixar();
    } catch (e) {
      setError(e?.message || "Erro ao baixar parcela");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Títulos">
      <Grid container spacing={2}>
        {/* Header + filtros */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Títulos Financeiros</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {titulosFiltrados.length} item(ns)
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ width: "fit-content", mt: 1 }}
                  >
                    Novo Título
                  </Button>
                </Stack>
              </Grid>

              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo</InputLabel>
                      <Select label="Tipo" value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="A_RECEBER">A_RECEBER</MenuItem>
                        <MenuItem value="A_PAGAR">A_PAGAR</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select label="Status" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="PENDENTE">PENDENTE</MenuItem>
                        <MenuItem value="ATRASADO">ATRASADO</MenuItem>
                        <MenuItem value="PAGO_RECEBIDO">PAGO_RECEBIDO</MenuItem>
                        <MenuItem value="CANCELADO">CANCELADO</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Buscar"
                      value={fBusca}
                      onChange={(e) => setFBusca(e.target.value)}
                      fullWidth
                    />
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
                      <TableCell><b>Descrição</b></TableCell>
                      <TableCell><b>Categoria</b></TableCell>
                      <TableCell><b>Emissão</b></TableCell>
                      <TableCell align="right"><b>Valor</b></TableCell>
                      <TableCell align="center"><b>Status</b></TableCell>
                      <TableCell align="center"><b>Parcelas</b></TableCell>
                      <TableCell align="center"><b>Ações</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {titulosFiltrados.map((t) => {
                      const parcelas = t.parcelas || [];
                      const pagas = parcelas.filter((p) => p.status === "PAGO_RECEBIDO").length;
                      const totalP = parcelas.length;

                      return (
                        <TableRow key={t.id} hover>
                          <TableCell>{t.id}</TableCell>
                          <TableCell>{chipTipo(t.tipo)}</TableCell>
                          <TableCell>{t.descricao}</TableCell>
                          <TableCell>{t.categoriaNome || "-"}</TableCell>
                          <TableCell>{dateBR(t.dataEmissao)}</TableCell>
                          <TableCell align="right">{money(t.valorTotal)}</TableCell>
                          <TableCell align="center">{chipStatus(t.status)}</TableCell>
                          <TableCell align="center">{totalP ? `${pagas}/${totalP}` : "-"}</TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => openDetalhes(t.id)}>
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {titulosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Typography align="center" color="text.secondary" py={3}>
                            Nenhum título encontrado
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

      {/* MODAL: CRIAR TÍTULO */}
      <Dialog open={openCreate} onClose={closeCreate} maxWidth="md" fullWidth>
        <DialogTitle>Novo Título</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={formCreate.tipo}
                    onChange={(e) =>
                      setFormCreate((f) => ({
                        ...f,
                        tipo: e.target.value,
                        categoriaId: "",
                      }))
                    }
                  >
                    <MenuItem value="A_RECEBER">A_RECEBER</MenuItem>
                    <MenuItem value="A_PAGAR">A_PAGAR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  label="Descrição"
                  value={formCreate.descricao}
                  onChange={(e) => setFormCreate((f) => ({ ...f, descricao: e.target.value }))}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Valor total"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={formCreate.valorTotal}
                  onChange={(e) => setFormCreate((f) => ({ ...f, valorTotal: e.target.value }))}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Categoria financeira</InputLabel>
                  <Select
                    label="Categoria financeira"
                    value={formCreate.categoriaId}
                    onChange={(e) => setFormCreate((f) => ({ ...f, categoriaId: e.target.value }))}
                  >
                    {categoriasDoTipo.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Forma de pagamento</InputLabel>
                  <Select
                    label="Forma de pagamento"
                    value={formCreate.formaPagamentoId}
                    onChange={(e) => setFormCreate((f) => ({ ...f, formaPagamentoId: e.target.value }))}
                  >
                    {(formasPagamento || [])
                      .filter((fp) => (fp.ativo ?? true) === true)
                      .map((fp) => (
                        <MenuItem key={fp.id} value={fp.id}>
                          {fp.tipo}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              Parcelamento
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Número de parcelas"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={formCreate.numeroParcelas}
                  onChange={(e) => setFormCreate((f) => ({ ...f, numeroParcelas: e.target.value }))}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="1º vencimento (YYYY-MM-DD)"
                  value={formCreate.primeiroVencimento}
                  onChange={(e) => setFormCreate((f) => ({ ...f, primeiroVencimento: e.target.value }))}
                  fullWidth
                  placeholder="2026-01-30"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Intervalo (dias)"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={formCreate.intervaloDias}
                  onChange={(e) => setFormCreate((f) => ({ ...f, intervaloDias: e.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Preview rápido
              </Typography>
              <Typography sx={{ fontWeight: 900 }}>
                {formCreate.tipo} • {money(formCreate.valorTotal)} • {formCreate.numeroParcelas}x • primeiro venc.:{" "}
                {dateOnlyBR(formCreate.primeiroVencimento)}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeCreate} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: DETALHES DO TÍTULO */}
      <Dialog open={openDetail} onClose={closeDetalhes} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes do Título</DialogTitle>
        <DialogContent dividers>
          {!detail ? (
            <Typography color="text.secondary">Nada para mostrar.</Typography>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">ID</Typography>
                    <Typography sx={{ fontWeight: 900 }}>#{detail.id}</Typography>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Tipo</Typography>
                    {chipTipo(detail.tipo)}
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    {chipStatus(detail.status)}
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Valor</Typography>
                    <Typography sx={{ fontWeight: 900 }}>{money(detail.valorTotal)}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Descrição</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{detail.descricao}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Categoria</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{detail.categoriaNome || "-"}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Emissão</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{dateBR(detail.dataEmissao)}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Divider />

              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Parcelas
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Nº</b></TableCell>
                    <TableCell><b>Venc.</b></TableCell>
                    <TableCell align="right"><b>Valor</b></TableCell>
                    <TableCell align="center"><b>Status</b></TableCell>
                    <TableCell><b>Data baixa</b></TableCell>
                    <TableCell align="center"><b>Ações</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(detail.parcelas || []).map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.numero}</TableCell>
                      <TableCell>{dateOnlyBR(p.vencimento)}</TableCell>
                      <TableCell align="right">{money(p.valor)}</TableCell>
                      <TableCell align="center">{chipStatus(p.status)}</TableCell>
                      <TableCell>{dateOnlyBR(p.dataBaixa)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={canBaixar(p) ? "Baixar parcela" : "Parcela não disponível"}>
                          <span>
                            <IconButton
                              disabled={!canBaixar(p)}
                              onClick={() => openBaixar(detail.id, p.id)}
                              color="success"
                            >
                              <PaymentsIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {(detail.parcelas || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography align="center" color="text.secondary" py={2}>
                          Sem parcelas
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetalhes}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: BAIXAR PARCELA */}
      <Dialog open={openBaixa} onClose={closeBaixar} maxWidth="sm" fullWidth>
        <DialogTitle>Baixar parcela</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Data da baixa (YYYY-MM-DD)"
              value={formBaixa.dataBaixa}
              onChange={(e) => setFormBaixa((f) => ({ ...f, dataBaixa: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Descrição (opcional)"
              value={formBaixa.descricao}
              onChange={(e) => setFormBaixa((f) => ({ ...f, descricao: e.target.value }))}
              fullWidth
            />
            <Box>
              <Alert severity="info">
                Ao baixar, o sistema deve criar uma movimentação no caixa e atualizar saldo/status.
              </Alert>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBaixar} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleBaixar} disabled={loading}>
            Confirmar baixa
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}