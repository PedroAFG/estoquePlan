import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import apiService from "../services/api";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Box,
  Divider,
  TextField,
} from "@mui/material";

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateBR(valor) {
  if (!valor) return "-";
  const d = dayjs(valor);
  return d.isValid() ? d.format("DD/MM/YYYY HH:mm:ss") : "-";
}

function getTipoLabel(tipo) {
  const map = {
    ENTRADA: "Entrada",
    SAIDA: "Saída",
  };
  return map[tipo] || tipo || "-";
}

export default function Caixa() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saldo, setSaldo] = useState(null);
  const [movs, setMovs] = useState([]);
  const [resumo, setResumo] = useState(null);

  const [inicioDate, setInicioDate] = useState(dayjs().startOf("day"));
  const [fimDate, setFimDate] = useState(dayjs().endOf("day"));
  const [tipo, setTipo] = useState("TODOS");

  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");

  const pageContentSx = {
    width: "100%",
    mx: 0,
  };

  const loadSaldo = async () => {
    const s = await apiService.getSaldoAtual();
    setSaldo(s?.saldoAtual ?? 0);
  };

  const periodoInvalido =
    !inicioDate || !fimDate || fimDate.isBefore(inicioDate, "day");

  const buscar = async () => {
    try {
      setLoading(true);
      setError("");

      const inicioStr = (inicioDate || dayjs()).format("YYYY-MM-DD");
      const fimStr = (fimDate || dayjs()).format("YYYY-MM-DD");

      await loadSaldo();

      const movsData = await apiService.getMovimentacoesCaixa({
        inicio: inicioStr,
        fim: fimStr,
        tipo: tipo === "TODOS" ? undefined : tipo,
      });

      setMovs(movsData || []);

      const resumoData = await apiService.getResumoCaixa({
        inicio: inicioStr,
        fim: fimStr,
      });

      setResumo(resumoData || null);
    } catch (e) {
      setError(e?.message || "Erro ao carregar caixa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLimpar = () => {
    setInicioDate(dayjs().startOf("day"));
    setFimDate(dayjs().endOf("day"));
    setTipo("TODOS");
    setValorMin("");
    setValorMax("");
  };

  const chipTipo = (t) => (
    <Chip
      size="small"
      label={getTipoLabel(t)}
      color={t === "ENTRADA" ? "success" : "warning"}
      variant="filled"
    />
  );

  const movsFiltradas = useMemo(() => {
    const min = valorMin === "" ? null : Number(valorMin);
    const max = valorMax === "" ? null : Number(valorMax);

    const list = [...(movs || [])]
      .filter((m) => {
        if (min === null || Number.isNaN(min)) return true;
        return Number(m.valor || 0) >= min;
      })
      .filter((m) => {
        if (max === null || Number.isNaN(max)) return true;
        return Number(m.valor || 0) <= max;
      })
      .sort((a, b) => new Date(b.dataHora || 0) - new Date(a.dataHora || 0));

    return list;
  }, [movs, valorMin, valorMax]);

  const periodoLabel = useMemo(() => {
    const inicio = inicioDate ? inicioDate.format("DD/MM/YYYY") : "-";
    const fim = fimDate ? fimDate.format("DD/MM/YYYY") : "-";
    return `${inicio} até ${fim}`;
  }, [inicioDate, fimDate]);

  return (
    <AppLayout title="Movimentação do Caixa">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <Grid container spacing={2}>
          {/* Barra superior única */}
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
                        Caixa
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Saldo atual do caixa (posição de hoje)
                      </Typography>

                      <Typography variant="h4" sx={{ fontWeight: 900 }}>
                        {saldo === null ? "-" : money(saldo)}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} lg={8}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Resumo do período filtrado
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Selecione um intervalo para ver entradas, saídas e resultado
                        do período.
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider />

                {/* Filtros */}
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                        xl: "minmax(180px,1fr) minmax(180px,1fr) minmax(160px,0.9fr) minmax(140px,0.8fr) minmax(140px,0.8fr) auto auto",
                      },
                      gap: 2,
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <DatePicker
                      label="Início"
                      value={inicioDate}
                      onChange={(v) => setInicioDate(v)}
                      format="DD/MM/YYYY"
                      slotProps={{ textField: { fullWidth: true } }}
                    />

                    <DatePicker
                      label="Fim"
                      value={fimDate}
                      onChange={(v) => setFimDate(v)}
                      format="DD/MM/YYYY"
                      slotProps={{ textField: { fullWidth: true } }}
                      minDate={inicioDate || undefined}
                    />

                    <FormControl fullWidth>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        label="Tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                      >
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="ENTRADA">Entrada</MenuItem>
                        <MenuItem value="SAIDA">Saída</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Valor mín."
                      type="number"
                      value={valorMin}
                      onChange={(e) => setValorMin(e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                      fullWidth
                    />

                    <TextField
                      label="Valor máx."
                      type="number"
                      value={valorMax}
                      onChange={(e) => setValorMax(e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                      fullWidth
                    />

                    <Button
                      variant="contained"
                      onClick={buscar}
                      disabled={loading || periodoInvalido}
                      sx={{
                        height: 56,
                        minWidth: 110,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Buscar
                    </Button>

                    <Button
                      variant="text"
                      onClick={handleLimpar}
                      sx={{
                        height: 56,
                        minWidth: 100,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Limpar
                    </Button>
                  </Box>

                  {periodoInvalido && (
                    <Alert severity="warning">
                      O período informado é inválido. A data final não pode ser menor
                      que a data inicial.
                    </Alert>
                  )}

                  <Alert severity="info">
                    O <strong>saldo atual</strong> mostra a posição do caixa neste
                    momento. Já os cards abaixo mostram o <strong>resumo do período
                    filtrado</strong>: {periodoLabel}.
                  </Alert>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {error && (
            <Grid item xs={12} sx={pageContentSx}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* Resumo do período */}
          <Grid item xs={12} sx={pageContentSx}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total de entradas no período
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {money(resumo?.totalEntradas)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total de saídas no período
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {money(resumo?.totalSaidas)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Resultado do período
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {money(resumo?.resultado)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Tabela / extrato */}
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
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Extrato do período
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Movimentações encontradas entre {periodoLabel}.
                </Typography>
              </Stack>

              {loading ? (
                <Stack alignItems="center" py={6}>
                  <CircularProgress />
                </Stack>
              ) : (
                <TableContainer sx={{ maxHeight: "65vh", width: "100%" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Data/Hora</b>
                        </TableCell>
                        <TableCell>
                          <b>Tipo</b>
                        </TableCell>
                        <TableCell>
                          <b>Descrição</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Valor</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Saldo após</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {movsFiltradas.map((m) => (
                        <TableRow key={m.id} hover>
                          <TableCell>{dateBR(m.dataHora)}</TableCell>
                          <TableCell>{chipTipo(m.tipo)}</TableCell>
                          <TableCell>{m.descricao || "-"}</TableCell>
                          <TableCell align="right">{money(m.valor)}</TableCell>
                          <TableCell align="right">
                            {money(m.saldoApos)}
                          </TableCell>
                        </TableRow>
                      ))}

                      {movsFiltradas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Typography
                              align="center"
                              color="text.secondary"
                              py={3}
                            >
                              Nenhuma movimentação encontrada para os filtros
                              informados
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
      </LocalizationProvider>
    </AppLayout>
  );
}