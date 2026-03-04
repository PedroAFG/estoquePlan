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
} from "@mui/material";

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dateBR(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return "-";
  }
}

export default function Caixa() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saldo, setSaldo] = useState(null);
  const [movs, setMovs] = useState([]);
  const [resumo, setResumo] = useState(null);

  // UI (datas amigáveis)
  const [inicioDate, setInicioDate] = useState(dayjs().startOf("day"));
  const [fimDate, setFimDate] = useState(dayjs().endOf("day"));

  // ✅ voltou (tava faltando)
  const [tipo, setTipo] = useState("TODOS");

  const loadSaldo = async () => {
    const s = await apiService.getSaldoAtual();
    setSaldo(s?.saldoAtual ?? 0);
  };

  const buscar = async () => {
    try {
      setLoading(true);
      setError("");

      // ISO do jeito que o backend quer
      const inicioISO = (inicioDate || dayjs()).startOf("day").toISOString();
      const fimISO = (fimDate || dayjs()).endOf("day").toISOString();

      await loadSaldo();

      const movsData = await apiService.getMovimentacoesCaixa({
        inicio: inicioISO,
        fim: fimISO,
        tipo: tipo === "TODOS" ? undefined : tipo,
      });

      setMovs(movsData || []);

      const resumoData = await apiService.getResumoCaixa({ inicio: inicioISO, fim: fimISO });
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

  const chipTipo = (t) => (
    <Chip
      size="small"
      label={t}
      color={t === "ENTRADA" ? "success" : "warning"}
      variant="filled"
    />
  );

  const movsOrdenadas = useMemo(() => {
    const list = [...(movs || [])];
    list.sort((a, b) => new Date(b.dataHora || 0) - new Date(a.dataHora || 0));
    return list;
  }, [movs]);

  return (
    <AppLayout title="Movimentação do Caixa">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <Grid container spacing={2}>
          {/* Header saldo + filtros */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6">Caixa</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saldo atual
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {saldo === null ? "-" : money(saldo)}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <DatePicker
                        label="Início"
                        value={inicioDate}
                        onChange={(v) => setInicioDate(v)}
                        format="DD/MM/YYYY"
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <DatePicker
                        label="Fim"
                        value={fimDate}
                        onChange={(v) => setFimDate(v)}
                        format="DD/MM/YYYY"
                        slotProps={{ textField: { fullWidth: true } }}
                        minDate={inicioDate || undefined}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                          <MenuItem value="TODOS">Todos</MenuItem>
                          <MenuItem value="ENTRADA">ENTRADA</MenuItem>
                          <MenuItem value="SAIDA">SAIDA</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={buscar}
                        disabled={loading}
                        sx={{ height: "56px" }}
                      >
                        Buscar
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

          {/* Resumo */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total entradas
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {money(resumo?.totalEntradas)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total saídas
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {money(resumo?.totalSaidas)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Resultado
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {money(resumo?.resultado)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Tabela extrato */}
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
                      {movsOrdenadas.map((m) => (
                        <TableRow key={m.id} hover>
                          <TableCell>{dateBR(m.dataHora)}</TableCell>
                          <TableCell>{chipTipo(m.tipo)}</TableCell>
                          <TableCell>{m.descricao || "-"}</TableCell>
                          <TableCell align="right">{money(m.valor)}</TableCell>
                          <TableCell align="right">{money(m.saldoApos)}</TableCell>
                        </TableRow>
                      ))}

                      {movsOrdenadas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Typography align="center" color="text.secondary" py={3}>
                              Nenhuma movimentação no período
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