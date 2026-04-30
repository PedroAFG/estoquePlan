import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import apiService from "../services/api";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import RemoveShoppingCartRoundedIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import dayjs from "dayjs";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const VIEW_OPTIONS = [
  { value: "estoque", label: "Indicadores de Estoque" },
  { value: "comercial", label: "Indicadores Comerciais" },
  { value: "financeiro", label: "Indicadores Financeiros" },
];

const PERIOD_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "last7", label: "Últimos 7 dias" },
  { value: "month", label: "Mês atual" },
  { value: "last30", label: "Últimos 30 dias" },
  { value: "custom", label: "Personalizado" },
];

const pieColors = ["#1976d2", "#ed6c02", "#d32f2f"];

function formatCurrency(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatNumber(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR");
}

function formatDateTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

function resolvePeriodDates(periodKey, customRange) {
  const today = dayjs();

  switch (periodKey) {
    case "today":
      return {
        inicio: today.format("YYYY-MM-DD"),
        fim: today.format("YYYY-MM-DD"),
      };

    case "yesterday": {
      const yesterday = today.subtract(1, "day");
      return {
        inicio: yesterday.format("YYYY-MM-DD"),
        fim: yesterday.format("YYYY-MM-DD"),
      };
    }

    case "last7":
      return {
        inicio: today.subtract(6, "day").format("YYYY-MM-DD"),
        fim: today.format("YYYY-MM-DD"),
      };

    case "month":
      return {
        inicio: today.startOf("month").format("YYYY-MM-DD"),
        fim: today.format("YYYY-MM-DD"),
      };

    case "last30":
      return {
        inicio: today.subtract(29, "day").format("YYYY-MM-DD"),
        fim: today.format("YYYY-MM-DD"),
      };

    case "custom":
      return {
        inicio: customRange.inicio || "",
        fim: customRange.fim || "",
      };

    default:
      return {
        inicio: today.startOf("month").format("YYYY-MM-DD"),
        fim: today.format("YYYY-MM-DD"),
      };
  }
}

function SummaryCard({ title, value, subtitle, icon, accent = "primary.main" }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        transition: "0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 6,
        },
      }}
    >
      <Stack spacing={2} height="100%">
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="overline" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: accent,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>

        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : (
          <Box sx={{ minHeight: 20 }} />
        )}
      </Stack>
    </Paper>
  );
}

function SectionHeader({ title, description }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Stack>
  );
}

export default function Dashboard() {
  const [view, setView] = useState("estoque");
  const [period, setPeriod] = useState("month");

  const [customRange, setCustomRange] = useState({
    inicio: "",
    fim: "",
  });

  const [appliedRange, setAppliedRange] = useState(resolvePeriodDates("month", { inicio: null, fim: null }));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [estoqueData, setEstoqueData] = useState(null);
  const [comercialData, setComercialData] = useState(null);
  const [financeiroData, setFinanceiroData] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);

  const cacheKey = useMemo(() => {
    return `${view}_${appliedRange.inicio || ""}_${appliedRange.fim || ""}`;
  }, [view, appliedRange]);

  const [cache, setCache] = useState({});

  const loadDashboard = useCallback(
    async ({ force = false } = {}) => {
      try {
        setLoading(true);
        setError("");

        if (!force && cache[cacheKey]) {
          const cached = cache[cacheKey];

          if (view === "estoque") setEstoqueData(cached);
          if (view === "comercial") setComercialData(cached);
          if (view === "financeiro") setFinanceiroData(cached);

          setLastUpdated(new Date());
          setLoading(false);
          return;
        }

        let result = null;

        if (view === "estoque") {
          result = await apiService.getDashboardEstoque(appliedRange);
          setEstoqueData(result);
        }

        if (view === "comercial") {
          result = await apiService.getDashboardComercial(appliedRange);
          setComercialData(result);
        }

        if (view === "financeiro") {
          result = await apiService.getDashboardFinanceiro(appliedRange);
          setFinanceiroData(result);
        }

        setCache((prev) => ({
          ...prev,
          [cacheKey]: result,
        }));

        setLastUpdated(new Date());
      } catch (e) {
        setError(e?.message || "Erro ao carregar o dashboard");
      } finally {
        setLoading(false);
      }
    },
    [view, appliedRange, cache, cacheKey]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleApplyPeriod = () => {
    if (period === "custom") {
      if (!customRange.inicio || !customRange.fim) {
        setError("Selecione a data inicial e a data final para aplicar o período personalizado.");
        return;
      }

      if (dayjs(customRange.inicio).isAfter(dayjs(customRange.fim))) {}
    }

    setError("");
    setAppliedRange(resolvePeriodDates(period, customRange));
  };

  const handleRefresh = () => {
    loadDashboard({ force: true });
  };

  const currentData =
    view === "estoque"
      ? estoqueData
      : view === "comercial"
        ? comercialData
        : financeiroData;

  const estoqueChartData = useMemo(() => {
    if (!estoqueData) return [];

    const totalProdutos = Number(estoqueData.totalProdutosCadastrados || 0);
    const baixo = Number(estoqueData.produtosComBaixoEstoque || 0);
    const zerados = Number(estoqueData.produtosSemEstoque || 0);
    const saudavel = Math.max(totalProdutos - baixo - zerados, 0);

    return [
      { name: "Saudável", value: saudavel },
      { name: "Baixo estoque", value: baixo },
      { name: "Sem estoque", value: zerados },
    ];
  }, [estoqueData]);

  const comercialChartData = useMemo(() => {
    if (!comercialData?.topProdutosVendidos) return [];

    return comercialData.topProdutosVendidos.map((item) => ({
      nome: item.descricao,
      quantidade: Number(item.quantidadeVendida || 0),
      valor: Number(item.valorTotalVendido || 0),
    }));
  }, [comercialData]);

  const financeiroChartData = useMemo(() => {
    if (!financeiroData) return [];

    return [
      {
        nome: "Entradas",
        valor: Number(financeiroData.totalEntradasPeriodo || 0),
      },
      {
        nome: "Saídas",
        valor: Number(financeiroData.totalSaidasPeriodo || 0),
      },
    ];
  }, [financeiroData]);

  const appliedPeriodLabel = useMemo(() => {
    if (!appliedRange.inicio || !appliedRange.fim) return "Período atual";

    const inicio = dayjs(appliedRange.inicio).format("DD/MM/YYYY");
    const fim = dayjs(appliedRange.fim).format("DD/MM/YYYY");

    if (inicio === fim) return `Período: ${inicio}`;
    return `Período: ${inicio} até ${fim}`;
  }, [appliedRange]);

  return (
    <AppLayout title="Dashboard">
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <InsightsRoundedIcon color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Dashboard Gerencial
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Acompanhe os principais indicadores do estoque, vendas e financeiro do sistema.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={appliedPeriodLabel} color="primary" variant="outlined" />
                {lastUpdated && (
                  <Chip
                    label={`Atualizado em ${lastUpdated.toLocaleTimeString("pt-BR")}`}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Stack>

            <Divider />

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Visão do dashboard</InputLabel>
                  <Select
                    value={view}
                    label="Visão do dashboard"
                    onChange={(e) => setView(e.target.value)}
                  >
                    {VIEW_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={period}
                    label="Período"
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    {PERIOD_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {period === "custom" && (
                <>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Data inicial"
                      type="date"
                      value={customRange.inicio}
                      onChange={(e) =>
                        setCustomRange((prev) => ({
                          ...prev,
                          inicio: e.target.value,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Data final"
                      type="date"
                      value={customRange.fim}
                      onChange={(e) =>
                        setCustomRange((prev) => ({
                          ...prev,
                          fim: e.target.value,
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={period === "custom" ? 3 : 7}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<SyncRoundedIcon />}
                    onClick={handleRefresh}
                    sx={{ height: 56, minWidth: 130 }}
                  >
                    Atualizar
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleApplyPeriod}
                    sx={{ height: 56, minWidth: 120 }}
                  >
                    Aplicar
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Paper sx={{ p: 6, borderRadius: 3 }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Carregando indicadores do dashboard...
              </Typography>
            </Stack>
          </Paper>
        ) : !currentData ? (
          <Paper sx={{ p: 6, borderRadius: 3 }}>
            <Stack alignItems="center" spacing={2}>
              <Typography variant="h6">Nenhum dado disponível</Typography>
              <Typography color="text.secondary">
                Não foi possível encontrar informações para a visão selecionada.
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <>
            {view === "estoque" && (
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} xl={3}>
                    <SummaryCard
                      title="Produtos cadastrados"
                      value={formatNumber(estoqueData?.totalProdutosCadastrados)}
                      subtitle="Total de produtos ativos considerados no controle atual."
                      icon={<Inventory2RoundedIcon />}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={3}>
                    <SummaryCard
                      title="Itens em estoque"
                      value={formatNumber(estoqueData?.quantidadeTotalEmEstoque)}
                      subtitle="Quantidade total disponível no estoque neste momento."
                      icon={<Inventory2RoundedIcon />}
                      accent="success.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={3}>
                    <SummaryCard
                      title="Baixo estoque"
                      value={formatNumber(estoqueData?.produtosComBaixoEstoque)}
                      subtitle="Produtos que já exigem atenção por estarem no limite mínimo."
                      icon={<WarningAmberRoundedIcon />}
                      accent="warning.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={3}>
                    <SummaryCard
                      title="Valor em estoque"
                      value={formatCurrency(estoqueData?.valorTotalEstoquePorCusto)}
                      subtitle="Estimativa do valor total do estoque com base no custo."
                      icon={<MonetizationOnRoundedIcon />}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <SummaryCard
                      title="Produtos sem estoque"
                      value={formatNumber(estoqueData?.produtosSemEstoque)}
                      subtitle="Itens zerados que podem impactar novas vendas ou reposição."
                      icon={<RemoveShoppingCartRoundedIcon />}
                      accent="error.main"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Situação do estoque"
                          description="Visão rápida da saúde operacional do estoque."
                        />

                        <Box sx={{ width: "100%", height: 320 }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={estoqueChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={105}
                                label
                              >
                                {estoqueChartData.map((entry, index) => (
                                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatNumber(value)} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Produtos com baixo estoque"
                          description="Itens que estão em alerta e podem exigir reposição."
                        />

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Produto</TableCell>
                                <TableCell align="right">Disponível</TableCell>
                                <TableCell align="right">Estoque mínimo</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(estoqueData?.produtosBaixoEstoque || []).length > 0 ? (
                                estoqueData.produtosBaixoEstoque.map((item) => (
                                  <TableRow key={item.id} hover>
                                    <TableCell>{item.descricao}</TableCell>
                                    <TableCell align="right">
                                      {formatNumber(item.quantidadeDisponivel)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatNumber(item.estoqueMinimo)}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    Nenhum produto em baixo estoque no momento.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Produtos zerados"
                          description="Itens sem saldo disponível no estoque."
                        />

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Produto</TableCell>
                                <TableCell align="right">Disponível</TableCell>
                                <TableCell align="right">Estoque mínimo</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(estoqueData?.produtosZerados || []).length > 0 ? (
                                estoqueData.produtosZerados.map((item) => (
                                  <TableRow key={item.id} hover>
                                    <TableCell>{item.descricao}</TableCell>
                                    <TableCell align="right">
                                      {formatNumber(item.quantidadeDisponivel)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatNumber(item.estoqueMinimo)}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    Nenhum produto zerado encontrado.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {view === "comercial" && (
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} xl={4}>
                    <SummaryCard
                      title="Total vendido"
                      value={formatCurrency(comercialData?.totalVendidoPeriodo)}
                      subtitle="Soma de todas as vendas ativas dentro do período filtrado."
                      icon={<ShoppingCartRoundedIcon />}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={4}>
                    <SummaryCard
                      title="Quantidade de vendas"
                      value={formatNumber(comercialData?.quantidadeVendasPeriodo)}
                      subtitle="Número de vendas registradas no período selecionado."
                      icon={<PointOfSaleRoundedIcon />}
                      accent="success.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={4}>
                    <SummaryCard
                      title="Ticket médio"
                      value={formatCurrency(comercialData?.ticketMedio)}
                      subtitle="Valor médio por venda, útil para percepção de desempenho comercial."
                      icon={<MonetizationOnRoundedIcon />}
                      accent="secondary.main"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Top 5 produtos mais vendidos"
                          description="Comparativo por quantidade vendida no período."
                        />

                        <Box sx={{ width: "100%", height: 320 }}>
                          <ResponsiveContainer>
                            <BarChart data={comercialChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="nome" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="quantidade" name="Quantidade vendida" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Clientes com maior volume de compras"
                          description="Ranking de clientes por valor total comprado no período."
                        />

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Cliente</TableCell>
                                <TableCell align="right">Compras</TableCell>
                                <TableCell align="right">Valor total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(comercialData?.topClientes || []).length > 0 ? (
                                comercialData.topClientes.map((cliente) => (
                                  <TableRow key={cliente.clienteId} hover>
                                    <TableCell>{cliente.nomeCliente}</TableCell>
                                    <TableCell align="right">
                                      {formatNumber(cliente.quantidadeCompras)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(cliente.valorTotalComprado)}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    Nenhum cliente encontrado para o período selecionado.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Detalhamento dos produtos mais vendidos"
                          description="Visão comparativa entre quantidade e valor vendido."
                        />

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Produto</TableCell>
                                <TableCell align="right">Quantidade vendida</TableCell>
                                <TableCell align="right">Valor total vendido</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(comercialData?.topProdutosVendidos || []).length > 0 ? (
                                comercialData.topProdutosVendidos.map((produto) => (
                                  <TableRow key={produto.produtoId} hover>
                                    <TableCell>{produto.descricao}</TableCell>
                                    <TableCell align="right">
                                      {formatNumber(produto.quantidadeVendida)}
                                    </TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(produto.valorTotalVendido)}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    Nenhum produto vendido encontrado no período.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {view === "financeiro" && (
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} xl={4}>
                    <SummaryCard
                      title="Total a receber em aberto"
                      value={formatCurrency(financeiroData?.totalReceberAberto)}
                      subtitle="Parcelas pendentes ou em atraso com expectativa de recebimento."
                      icon={<TrendingUpRoundedIcon />}
                      accent="success.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={4}>
                    <SummaryCard
                      title="Total a pagar em aberto"
                      value={formatCurrency(financeiroData?.totalPagarAberto)}
                      subtitle="Compromissos financeiros ainda não quitados."
                      icon={<TrendingDownRoundedIcon />}
                      accent="error.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={4}>
                    <SummaryCard
                      title="Parcelas vencidas"
                      value={formatNumber(financeiroData?.parcelasVencidas)}
                      subtitle="Títulos vencidos que merecem atenção imediata."
                      icon={<WarningAmberRoundedIcon />}
                      accent="warning.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={3}>
                    <SummaryCard
                      title="Recebido no período"
                      value={formatCurrency(financeiroData?.recebidoPeriodo)}
                      subtitle="Total efetivamente recebido no intervalo aplicado."
                      icon={<PaymentsRoundedIcon />}
                      accent="success.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={3}>
                    <SummaryCard
                      title="Pago no período"
                      value={formatCurrency(financeiroData?.pagoPeriodo)}
                      subtitle="Saídas financeiras confirmadas dentro do período."
                      icon={<PaymentsRoundedIcon />}
                      accent="warning.main"
                    />
                  </Grid>

                  <Grid item xs={12} md={6} xl={6}>
                    <SummaryCard
                      title="Saldo atual do caixa"
                      value={formatCurrency(financeiroData?.saldoAtualCaixa)}
                      subtitle="Último saldo consolidado após as movimentações registradas."
                      icon={<AccountBalanceWalletRoundedIcon />}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Entradas x saídas"
                          description="Comparativo financeiro do período selecionado."
                        />

                        <Box sx={{ width: "100%", height: 320 }}>
                          <ResponsiveContainer>
                            <BarChart data={financeiroChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="nome" />
                              <YAxis />
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                              <Legend />
                              <Bar dataKey="valor" name="Valor" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Resumo financeiro do período"
                          description="Leitura rápida dos principais números para acompanhamento."
                        />

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="overline">Entradas no período</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                  {formatCurrency(financeiroData?.totalEntradasPeriodo)}
                                </Typography>
                              </Stack>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="overline">Saídas no período</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                  {formatCurrency(financeiroData?.totalSaidasPeriodo)}
                                </Typography>
                              </Stack>
                            </Paper>
                          </Grid>
                        </Grid>

                        <Alert severity="info">
                          O saldo atual do caixa reflete a última movimentação registrada no sistema.
                        </Alert>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Stack spacing={2}>
                        <SectionHeader
                          title="Últimas movimentações de caixa"
                          description="Histórico recente para facilitar conferência e rastreabilidade."
                        />

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Descrição</TableCell>
                                <TableCell>Data e hora</TableCell>
                                <TableCell align="right">Valor</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(financeiroData?.ultimasMovimentacoes || []).length > 0 ? (
                                financeiroData.ultimasMovimentacoes.map((mov) => (
                                  <TableRow key={mov.id} hover>
                                    <TableCell>
                                      <Chip
                                        label={mov.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                                        color={mov.tipo === "ENTRADA" ? "success" : "warning"}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 420 }}>
                                      <Typography variant="body2">
                                        {mov.descricao || "-"}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{formatDateTime(mov.dataHora)}</TableCell>
                                    <TableCell align="right">
                                      {formatCurrency(mov.valor)}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} align="center">
                                    Nenhuma movimentação encontrada para exibição.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </AppLayout>
  );
}