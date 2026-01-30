import React from "react";
import AppLayout from "../layout/AppLayout";
import { Grid, Paper, Typography, Stack } from "@mui/material";

export default function Dashboard() {
  // Por enquanto, deixa placeholders (depois você liga na API)
  const resumo = {
    totalProdutos: "-",
    itensEmEstoque: "-",
    baixoEstoque: "-",
    valorEstoque: "-",
  };

  return (
    <AppLayout title="Dashboard">
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline">Quantidade de produtos</Typography>
              <Typography variant="h5">{resumo.totalProdutos}</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline">Itens em estoque</Typography>
              <Typography variant="h5">{resumo.itensEmEstoque}</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline">Baixo estoque</Typography>
              <Typography variant="h5">{resumo.baixoEstoque}</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="overline">Valor em estoque</Typography>
              <Typography variant="h5">{resumo.valorEstoque}</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Informativos do estoque
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aqui vai entrar uma tabela (ex.: produtos com baixo estoque, últimas movimentações, etc.)
              — mas sem dados fake no front. Vamos ligar na API depois.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </AppLayout>
  );
}