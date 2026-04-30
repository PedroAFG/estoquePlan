import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import apiService from "../services/api";

import {
  Grid,
  Paper,
  Checkbox,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
import BlockIcon from "@mui/icons-material/Block";
import dayjs from "dayjs";

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

function getTipoLabel(tipo) {
  const map = {
    A_RECEBER: "A receber",
    A_PAGAR: "A pagar",
  };
  return map[tipo] || tipo || "-";
}

function getStatusLabel(status) {
  const map = {
    PENDENTE: "Pendente",
    ATRASADO: "Atrasado",
    PAGO_RECEBIDO: "Pago/Recebido",
    CANCELADO: "Cancelado",
  };
  return map[status] || status || "-";
}

const emptyCreate = {
  tipo: "A_RECEBER",
  descricao: "",
  valorTotal: "",
  categoriaId: "",
  formaPagamentoId: "",
  tipoPagamento: "AVISTA",
  numeroParcelas: 1,
  primeiroVencimento: dayjs().format("YYYY-MM-DD"),
  intervaloDias: 30,
};

const emptyCreateErrors = {
  descricao: "",
  valorTotal: "",
  categoriaId: "",
  formaPagamentoId: "",
  numeroParcelas: "",
  primeiroVencimento: "",
  intervaloDias: "",
};

const emptyBaixa = {
  dataBaixa: "",
  descricao: "",
};

const emptyFilters = {
  busca: "",
  tipo: "TODOS",
  status: "TODOS",
  categoriaId: "",
  periodo: "month",
  dataInicial: dayjs().startOf("month").format("YYYY-MM-DD"),
  dataFinal: dayjs().format("YYYY-MM-DD"),
};

export default function FinanceiroTitulos() {
  const [loading, setLoading] = useState(true);
  const [pageSuccess, setPageSuccess] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [baixaSuccess, setBaixaSuccess] = useState("");

  const [pageError, setPageError] = useState("");
  const [createError, setCreateError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [baixaError, setBaixaError] = useState("");

  const [titulos, setTitulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);

  const [filters, setFilters] = useState(emptyFilters);

  const [openCreate, setOpenCreate] = useState(false);
  const [formCreate, setFormCreate] = useState(emptyCreate);
  const [createErrors, setCreateErrors] = useState(emptyCreateErrors);

  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState(null);

  const [openBaixa, setOpenBaixa] = useState(false);
  const [baixaTarget, setBaixaTarget] = useState(null);
  const [formBaixa, setFormBaixa] = useState(emptyBaixa);

  const [openConfirmCancel, setOpenConfirmCancel] = useState(false);
  const [tituloToCancel, setTituloToCancel] = useState(null);

  const [openImport, setOpenImport] = useState(false);

  const total = titulos.length;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const carregarUsuarioLogado = async () => {
      try {
        const me = await apiService.getMe();
        setIsAdmin(me?.permissao === "ADMINISTRADOR");
      } catch {
        setIsAdmin(false);
      }
    };

    carregarUsuarioLogado();
  }, []);

  const handleTipoPagamentoChange = (tipoPagamento) => {
    const hoje = dayjs().format("YYYY-MM-DD");

    setFormCreate((prev) => ({
      ...prev,
      tipoPagamento,
      numeroParcelas: tipoPagamento === "AVISTA" ? 1 : prev.numeroParcelas || 2,
      primeiroVencimento:
        tipoPagamento === "AVISTA" ? hoje : prev.primeiroVencimento || hoje,
      intervaloDias: tipoPagamento === "AVISTA" ? 30 : prev.intervaloDias || 30,
    }));

    setCreateErrors((prev) => ({
      ...prev,
      numeroParcelas: "",
      primeiroVencimento: "",
      intervaloDias: "",
    }));

    setCreateError("");
  };

  const pageContentSx = {
    width: "100%",
    mx: 0,
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [titulosData, catData, fpData] = await Promise.all([
        apiService.getTitulosFinanceiros(),
        apiService.getCategoriasFinanceiras(),
        apiService.getFormasPagamento(),
      ]);

      setTitulos(titulosData || []);
      setCategorias(catData || []);
      setFormasPagamento(fpData || []);
    } catch (e) {
      setPageError(e?.message || "Erro ao carregar financeiro");
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
      label={getTipoLabel(tipo)}
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
      <Chip
        size="small"
        label={getStatusLabel(st)}
        color={map[st] || "default"}
        variant={st === "CANCELADO" ? "outlined" : "filled"}
      />
    );
  };

  const titulosFiltrados = useMemo(() => {
    const b = String(filters.busca || "").trim().toLowerCase();

    return (titulos || [])
      .filter((t) => (filters.tipo === "TODOS" ? true : t.tipo === filters.tipo))
      .filter((t) =>
        filters.status === "TODOS" ? true : t.status === filters.status
      )
      .filter((t) => {
        if (!filters.categoriaId) return true;
        return String(t.categoriaId || "") === String(filters.categoriaId);
      })
      .filter((t) => {
        if (!b) return true;

        const s = `
          ${t.descricao || ""}
          ${t.categoriaNome || ""}
          ${t.id || ""}
        `.toLowerCase();

        return s.includes(b);
      })
      .filter((t) => {
        if (!filters.dataInicial) return true;
        const emissao = t.dataEmissao ? new Date(t.dataEmissao) : null;
        if (!emissao || Number.isNaN(emissao.getTime())) return false;

        const inicio = new Date(`${filters.dataInicial}T00:00:00`);
        return emissao >= inicio;
      })
      .filter((t) => {
        if (!filters.dataFinal) return true;
        const emissao = t.dataEmissao ? new Date(t.dataEmissao) : null;
        if (!emissao || Number.isNaN(emissao.getTime())) return false;

        const fim = new Date(`${filters.dataFinal}T23:59:59`);
        return emissao <= fim;
      })
      .sort((a, b2) => Number(b2.id) - Number(a.id));
  }, [titulos, filters]);

  const categoriasDoTipo = useMemo(() => {
    return (categorias || []).filter(
      (c) => (c.ativo ?? true) === true && c.tipo === formCreate.tipo
    );
  }, [categorias, formCreate.tipo]);

  const validateCreateForm = () => {
    const novosErros = {
      descricao: "",
      valorTotal: "",
      categoriaId: "",
      formaPagamentoId: "",
      numeroParcelas: "",
      primeiroVencimento: "",
      intervaloDias: "",
    };

    const descricao = String(formCreate.descricao || "").trim();
    const valorTotal = Number(formCreate.valorTotal || 0);
    const categoriaId = Number(formCreate.categoriaId);
    const formaPagamentoId = Number(formCreate.formaPagamentoId);
    const numeroParcelas = Number(formCreate.numeroParcelas || 0);
    const primeiroVencimento = String(formCreate.primeiroVencimento || "").trim();
    const intervaloDias = Number(formCreate.intervaloDias || 0);

    if (!descricao) {
      novosErros.descricao = "Informe a descrição.";
    }

    if (!valorTotal || valorTotal <= 0) {
      novosErros.valorTotal = "Informe um valor total maior que zero.";
    }

    if (!categoriaId) {
      novosErros.categoriaId = "Selecione uma categoria financeira.";
    }

    if (!formaPagamentoId) {
      novosErros.formaPagamentoId = "Selecione uma forma de pagamento.";
    }

    if (!numeroParcelas || numeroParcelas < 1) {
      novosErros.numeroParcelas = "Informe ao menos 1 parcela.";
    }

    if (!primeiroVencimento) {
      novosErros.primeiroVencimento = "Informe o primeiro vencimento.";
    }

    if (!intervaloDias || intervaloDias < 1) {
      novosErros.intervaloDias = "Informe um intervalo válido.";
    }

    setCreateErrors(novosErros);

    return !Object.values(novosErros).some(Boolean);
  };

  const updateCreateField = (campo, valor) => {
    setFormCreate((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setCreateErrors((prev) => ({
      ...prev,
      [campo]: "",
    }));

    setCreateError("");
    setCreateSuccess("");
  };

  const openDetalhes = async (id) => {
    try {
      setDetailError("");
      setLoading(true);

      const data = await apiService.getTituloFinanceiroById(id);
      setDetail(data);
      setOpenDetail(true);
    } catch (e) {
      setDetailError(e?.message || "Erro ao abrir detalhes");
    } finally {
      setLoading(false);
    }
  };

  const closeDetalhes = () => {
    setOpenDetail(false);
    setDetail(null);
    setDetailError("");
  };

  const handleOpenCreate = () => {
    setCreateError("");
    setCreateSuccess("");
    setCreateErrors(emptyCreateErrors);
    setFormCreate(emptyCreate);
    setOpenCreate(true);
  };

  const closeCreate = () => {
    setOpenCreate(false);
    setCreateError("");
    setCreateSuccess("");
    setCreateErrors(emptyCreateErrors);
    setFormCreate(emptyCreate);
  };

  const handleCreate = async () => {
    try {
      setCreateError("");
      setCreateSuccess("");

      const isValid = validateCreateForm();
      if (!isValid) return;

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

      setLoading(true);
      const created = await apiService.createTituloFinanceiro(payload);
      setTitulos((prev) => [created, ...(prev || [])]);

      setPageSuccess("Título criado com sucesso.");
      closeCreate();
    } catch (e) {
      setCreateError(e?.message || "Erro ao criar título");
    } finally {
      setLoading(false);
    }
  };

  const canBaixar = (p) => p?.status === "PENDENTE" || p?.status === "ATRASADO";

  const openBaixar = (tituloId, parcelaId) => {
    setBaixaError("");
    setBaixaSuccess("");
    setBaixaTarget({ tituloId, parcelaId });
    setFormBaixa({
      dataBaixa: new Date().toISOString().slice(0, 10),
      descricao: "",
    });
    setOpenBaixa(true);
  };

  const closeBaixar = () => {
    setOpenBaixa(false);
    setBaixaTarget(null);
    setBaixaError("");
    setBaixaSuccess("");
    setFormBaixa(emptyBaixa);
  };

  const handleBaixar = async () => {
    try {
      if (!baixaTarget?.parcelaId) return;

      setBaixaError("");
      setBaixaSuccess("");

      const payload = {
        dataBaixa: String(formBaixa.dataBaixa || "").trim(),
        descricao: String(formBaixa.descricao || "").trim(),
      };

      const body = {};
      if (payload.dataBaixa) body.dataBaixa = payload.dataBaixa;
      if (payload.descricao) body.descricao = payload.descricao;

      setLoading(true);
      await apiService.baixarParcela(baixaTarget.parcelaId, body);

      const updated = await apiService.getTituloFinanceiroById(
        baixaTarget.tituloId
      );
      setDetail(updated);

      const all = await apiService.getTitulosFinanceiros();
      setTitulos(all || []);

      setPageSuccess("Parcela baixada com sucesso.");
      closeBaixar();
    } catch (e) {
      setBaixaError(e?.message || "Erro ao baixar parcela");
    } finally {
      setLoading(false);
    }
  };

  const canCancelarTitulo = (titulo) => {
    return titulo?.status !== "CANCELADO" && titulo?.status !== "PAGO_RECEBIDO";
  };

  const handleCancelarTitulo = async (titulo) => {
    if (!titulo?.id) return;

    const confirmou = window.confirm(
      `Deseja cancelar o título #${titulo.id}?\n\nAs parcelas pendentes também serão canceladas.`
    );

    if (!confirmou) return;

    try {
      setPageError("");
      setPageSuccess("");
      setDetailError("");
      setLoading(true);

      const atualizado = await apiService.cancelarTituloFinanceiro(titulo.id);

      setTitulos((prev) =>
        (prev || []).map((t) => (t.id === titulo.id ? atualizado : t))
      );

      if (detail?.id === titulo.id) {
        setDetail(atualizado);
      }

      setPageSuccess("Título cancelado com sucesso.");
    } catch (e) {
      const mensagem =
        e?.message ||
        "Erro ao cancelar título. Verifique se ele está vinculado a uma venda.";

      if (openDetail) {
        setDetailError(mensagem);
      } else {
        setPageError(mensagem);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmarCancelamento = async () => {
    if (!tituloToCancel) return;

    try {
      setLoading(true);

      const atualizado = await apiService.cancelarTituloFinanceiro(
        tituloToCancel.id
      );

      setTitulos((prev) =>
        prev.map((t) => (t.id === atualizado.id ? atualizado : t))
      );

      if (detail?.id === atualizado.id) {
        setDetail(atualizado);
      }

      setPageSuccess("Título cancelado com sucesso.");
    } catch (e) {
      setPageError(
        e?.message ||
        "Não foi possível cancelar o título (possivelmente vinculado a venda)."
      );
    } finally {
      setLoading(false);
      setOpenConfirmCancel(false);
      setTituloToCancel(null);
    }
  };

  const PERIOD_OPTIONS = [
    { value: "today", label: "Hoje" },
    { value: "yesterday", label: "Ontem" },
    { value: "last7", label: "Últimos 7 dias" },
    { value: "month", label: "Mês atual" },
    { value: "last30", label: "Últimos 30 dias" },
    { value: "custom", label: "Período personalizado" },
  ];

  function resolvePeriodDates(periodKey, customRange) {
    const today = dayjs();

    switch (periodKey) {
      case "today":
        return {
          dataInicial: today.format("YYYY-MM-DD"),
          dataFinal: today.format("YYYY-MM-DD"),
        };

      case "yesterday": {
        const yesterday = today.subtract(1, "day");
        return {
          dataInicial: yesterday.format("YYYY-MM-DD"),
          dataFinal: yesterday.format("YYYY-MM-DD"),
        };
      }

      case "last7":
        return {
          dataInicial: today.subtract(6, "day").format("YYYY-MM-DD"),
          dataFinal: today.format("YYYY-MM-DD"),
        };

      case "month":
        return {
          dataInicial: today.startOf("month").format("YYYY-MM-DD"),
          dataFinal: today.format("YYYY-MM-DD"),
        };

      case "last30":
        return {
          dataInicial: today.subtract(29, "day").format("YYYY-MM-DD"),
          dataFinal: today.format("YYYY-MM-DD"),
        };

      case "custom":
        return {
          dataInicial: customRange.dataInicial || "",
          dataFinal: customRange.dataFinal || "",
        };

      default:
        return {
          dataInicial: "",
          dataFinal: "",
        };
    }
  }

  const baixarArquivo = (blob, nomeArquivo) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportarXlsx = async () => {
    try {
      setPageError("");
      setPageSuccess("");
      setLoading(true);

      const blob = await apiService.exportarTitulosXlsx();
      baixarArquivo(blob, "titulos_financeiros.xlsx");

      setPageSuccess("Títulos exportados em XLSX com sucesso.");
    } catch (e) {
      setPageError(e?.message || "Erro ao exportar XLSX.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPdf = async () => {
    try {
      setPageError("");
      setPageSuccess("");
      setLoading(true);

      const blob = await apiService.exportarTitulosPdf();
      baixarArquivo(blob, "titulos_financeiros.pdf");

      setPageSuccess("Títulos exportados em PDF com sucesso.");
    } catch (e) {
      setPageError(e?.message || "Erro ao exportar PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportarXlsx = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPageError("");
      setPageSuccess("");
      setLoading(true);

      const msg = await apiService.importarTitulosXlsx(file);

      await loadData();

      setPageSuccess(msg || "Títulos importados com sucesso.");
      setOpenImport(false);
    } catch (e) {
      setPageError(e?.message || "Erro ao importar títulos.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <AppLayout title="Títulos">
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
                      Títulos financeiros
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {titulosFiltrados.length} de {total} item(ns)
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
                      onClick={handleOpenCreate}
                    >
                      Novo título
                    </Button>
                    <Button variant="contained" onClick={() => setOpenImport(true)}>
                      Importar
                    </Button>

                    <Button variant="contained" onClick={handleExportarXlsx}>
                      Exportar XLSX
                    </Button>

                    <Button variant="contained" onClick={handleExportarPdf}>
                      Exportar PDF
                    </Button>
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
                    xl:
                      filters.periodo === "custom"
                        ? "minmax(220px,1.4fr) minmax(140px,0.8fr) minmax(140px,0.8fr) minmax(200px,1.1fr) minmax(190px,1fr) minmax(150px,0.8fr) minmax(150px,0.8fr) auto"
                        : "minmax(220px,1.5fr) minmax(140px,0.8fr) minmax(140px,0.8fr) minmax(220px,1.2fr) minmax(190px,1fr) auto",
                  },
                  gap: 2,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TextField
                  label="Buscar"
                  placeholder="Descrição, categoria ou ID"
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
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={filters.tipo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        tipo: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="TODOS">Todos</MenuItem>
                    <MenuItem value="A_RECEBER">A receber</MenuItem>
                    <MenuItem value="A_PAGAR">A pagar</MenuItem>
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
                    <MenuItem value="PENDENTE">Pendente</MenuItem>
                    <MenuItem value="ATRASADO">Atrasado</MenuItem>
                    <MenuItem value="PAGO_RECEBIDO">Pago/Recebido</MenuItem>
                    <MenuItem value="CANCELADO">Cancelado</MenuItem>
                  </Select>
                </FormControl>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoria financeira</InputLabel>
                    <Select
                      label="Categoria financeira"
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
                </Grid>

                <FormControl fullWidth>
                  <InputLabel>Período</InputLabel>
                  <Select
                    label="Período"
                    value={filters.periodo}
                    onChange={(e) => {
                      const novoPeriodo = e.target.value;

                      setFilters((prev) => {
                        const datas = resolvePeriodDates(novoPeriodo, {
                          dataInicial: prev.dataInicial,
                          dataFinal: prev.dataFinal,
                        });

                        return {
                          ...prev,
                          periodo: novoPeriodo,
                          dataInicial: datas.dataInicial,
                          dataFinal: datas.dataFinal,
                        };
                      });
                    }}
                  >
                    {PERIOD_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {filters.periodo === "custom" && (
                  <>
                    <TextField
                      label="Data inicial"
                      type="date"
                      value={filters.dataInicial}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dataInicial: e.target.value,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />

                    <TextField
                      label="Data final"
                      type="date"
                      value={filters.dataFinal}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dataFinal: e.target.value,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </>
                )}

                <Button
                  variant="text"
                  onClick={() => setFilters(emptyFilters)}
                  sx={{
                    height: 56,
                    minWidth: 90,
                    px: 1.5,
                    whiteSpace: "nowrap",
                    justifySelf: { xs: "start", xl: "end" },
                  }}
                >
                  Limpar
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {pageError && (
          <Grid item xs={12} sx={pageContentSx}>
            <Alert severity="error" onClose={() => setPageError("")}>
              {pageError}
            </Alert>
          </Grid>
        )}

        {pageSuccess && (
          <Grid item xs={12} sx={pageContentSx}>
            <Alert severity="success" onClose={() => setPageSuccess("")}>
              {pageSuccess}
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
                      <TableCell>
                        <b>ID</b>
                      </TableCell>
                      <TableCell>
                        <b>Tipo</b>
                      </TableCell>
                      <TableCell>
                        <b>Descrição</b>
                      </TableCell>
                      <TableCell>
                        <b>Categoria</b>
                      </TableCell>
                      <TableCell>
                        <b>Emissão</b>
                      </TableCell>
                      <TableCell align="right">
                        <b>Valor</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Status</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Parcelas</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Ações</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {titulosFiltrados.map((t) => {
                      const parcelas = t.parcelas || [];
                      const pagas = parcelas.filter(
                        (p) => p.status === "PAGO_RECEBIDO"
                      ).length;
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
                          <TableCell align="center">
                            {totalP ? `${pagas} de ${totalP}` : "-"}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalhes">
                              <IconButton onClick={() => openDetalhes(t.id)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>

                            {isAdmin ? (
                              <Tooltip
                                title={
                                  canCancelarTitulo(t)
                                    ? "Cancelar título"
                                    : "Título não disponível para cancelamento"
                                }
                              >
                                <span>
                                  <IconButton
                                    color="warning"
                                    disabled={!canCancelarTitulo(t)}
                                    onClick={() => {
                                      setTituloToCancel(t);
                                      setOpenConfirmCancel(true);
                                    }}
                                  >
                                    <BlockIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Cancelamento disponível apenas para administradores">
                                <span>
                                  <IconButton disabled>
                                    <BlockIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
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

      <Dialog
        open={openCreate}
        onClose={closeCreate}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Novo título</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            {createError && (
              <Alert severity="error" onClose={() => setCreateError("")}>
                {createError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={formCreate.tipo}
                    onChange={(e) => {
                      const novoTipo = e.target.value;

                      setFormCreate((prev) => ({
                        ...prev,
                        tipo: novoTipo,
                        categoriaId: "",
                      }));

                      setCreateErrors((prev) => ({
                        ...prev,
                        categoriaId: "",
                      }));

                      setCreateError("");
                    }}
                  >
                    <MenuItem value="A_RECEBER">A receber</MenuItem>
                    <MenuItem value="A_PAGAR">A pagar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  label="Descrição"
                  value={formCreate.descricao}
                  onChange={(e) => updateCreateField("descricao", e.target.value)}
                  error={!!createErrors.descricao}
                  helperText={createErrors.descricao}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Valor total"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={formCreate.valorTotal}
                  onChange={(e) => updateCreateField("valorTotal", e.target.value)}
                  error={!!createErrors.valorTotal}
                  helperText={createErrors.valorTotal}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  size="medium"
                  error={!!createErrors.categoriaId}
                  sx={{ width: "100%", minWidth: 280 }}
                >
                  <InputLabel>Categoria financeira</InputLabel>
                  <Select
                    label="Categoria financeira"
                    value={formCreate.categoriaId}
                    onChange={(e) => updateCreateField("categoriaId", e.target.value)}
                    sx={{ width: "100%" }}
                  >
                    {categoriasDoTipo.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nome}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{createErrors.categoriaId}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  size="medium"
                  error={!!createErrors.formaPagamentoId}
                  sx={{ width: "100%", minWidth: 280 }}
                >
                  <InputLabel>Forma de pagamento</InputLabel>
                  <Select
                    label="Forma de pagamento"
                    value={formCreate.formaPagamentoId}
                    onChange={(e) => updateCreateField("formaPagamentoId", e.target.value)}
                    sx={{ width: "100%" }}
                  >
                    {(formasPagamento || [])
                      .filter((fp) => (fp.ativo ?? true) === true)
                      .map((fp) => (
                        <MenuItem key={fp.id} value={fp.id}>
                          {fp.tipo}
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>{createErrors.formaPagamentoId}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              Parcelamento
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formCreate.tipoPagamento === "AVISTA"}
                    onChange={() => handleTipoPagamentoChange("AVISTA")}
                  />
                }
                label="Pagamento à vista"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formCreate.tipoPagamento === "PARCELADO"}
                    onChange={() => handleTipoPagamentoChange("PARCELADO")}
                  />
                }
                label="Pagamento parcelado"
              />
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Número de parcelas"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={formCreate.numeroParcelas}
                  onChange={(e) => updateCreateField("numeroParcelas", e.target.value)}
                  error={!!createErrors.numeroParcelas}
                  helperText={createErrors.numeroParcelas}
                  fullWidth
                  disabled={formCreate.tipoPagamento === "AVISTA"}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="1º vencimento"
                  type="date"
                  value={formCreate.primeiroVencimento}
                  onChange={(e) => updateCreateField("primeiroVencimento", e.target.value)}
                  error={!!createErrors.primeiroVencimento}
                  helperText={createErrors.primeiroVencimento}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={formCreate.tipoPagamento === "AVISTA"}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Intervalo (dias)"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={formCreate.intervaloDias}
                  onChange={(e) => updateCreateField("intervaloDias", e.target.value)}
                  error={!!createErrors.intervaloDias}
                  helperText={createErrors.intervaloDias}
                  fullWidth
                  disabled={formCreate.tipoPagamento === "AVISTA"}
                />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Preview rápido
              </Typography>
              <Typography sx={{ fontWeight: 900 }}>
                {getTipoLabel(formCreate.tipo)} • {money(formCreate.valorTotal)} •{" "}
                {formCreate.numeroParcelas}x • primeiro venc.:{" "}
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

      <Dialog
        open={openDetail}
        onClose={closeDetalhes}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Detalhes do título</DialogTitle>
        <DialogContent dividers>
          {detailError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDetailError("")}>
              {detailError}
            </Alert>
          )}

          {!detail ? (
            <Typography color="text.secondary">Nada para mostrar.</Typography>
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      ID
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}>#{detail.id}</Typography>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Tipo
                    </Typography>
                    {chipTipo(detail.tipo)}
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    {chipStatus(detail.status)}
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Valor
                    </Typography>
                    <Typography sx={{ fontWeight: 900 }}>
                      {money(detail.valorTotal)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Descrição
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {detail.descricao}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Categoria
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {detail.categoriaNome || "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Emissão
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {dateBR(detail.dataEmissao)}
                    </Typography>
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
                    <TableCell>
                      <b>Nº</b>
                    </TableCell>
                    <TableCell>
                      <b>Vencimento</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>Valor</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Status</b>
                    </TableCell>
                    <TableCell>
                      <b>Data da baixa</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Ações</b>
                    </TableCell>
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
                        <Tooltip
                          title={
                            canBaixar(p)
                              ? "Baixar parcela"
                              : "Parcela não disponível"
                          }
                        >
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
          {isAdmin ? (
            <Button
              color="warning"
              variant="outlined"
              startIcon={<BlockIcon />}
              disabled={!canCancelarTitulo(detail) || loading}
              onClick={() => {
                setTituloToCancel(detail);
                setOpenConfirmCancel(true);
              }}
            >
              Cancelar título
            </Button>
          ) : (
            <Tooltip title="Cancelamento disponível apenas para administradores">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<BlockIcon />}
                  disabled
                >
                  Cancelar título
                </Button>
              </span>
            </Tooltip>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBaixa}
        onClose={closeBaixar}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Baixar parcela</DialogTitle>

        <DialogContent dividers>
          {/* conteúdo da baixa */}
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

      <Dialog
        open={openConfirmCancel}
        onClose={() => {
          setOpenConfirmCancel(false);
          setTituloToCancel(null);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Cancelar título
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              Tem certeza que deseja cancelar o título{" "}
              <strong>{tituloToCancel?.id}</strong>?
            </Typography>

            <Alert severity="warning">
              Essa ação irá cancelar todas as parcelas pendentes.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenConfirmCancel(false);
              setTituloToCancel(null);
            }}
          >
            Voltar
          </Button>

          <Button
            variant="contained"
            color="warning"
            onClick={confirmarCancelamento}
            disabled={loading}
          >
            Confirmar cancelamento
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openImport}
        onClose={() => setOpenImport(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Importar títulos</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info">
              Utilize o modelo padrão. Categoria e forma de pagamento devem existir no sistema.
            </Alert>

            <Button
              variant="contained"
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/modelos/titulos_modelo.xlsx";
                link.download = "modelo_importacao_titulos.xlsx";
                link.click();
              }}
            >
              Baixar modelo XLSX
            </Button>

            <Button variant="contained" component="label">
              Selecionar arquivo XLSX
              <input
                type="file"
                hidden
                accept=".xlsx"
                onChange={handleImportarXlsx}
              />
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenImport(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}