import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Box,
  Chip,
} from "@mui/material";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CategoryIcon from "@mui/icons-material/Category";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";

export default function CadastrosGerais() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clientes, setClientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasFinanceiras, setCategoriasFinanceiras] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          dataClientes,
          dataCategorias,
          dataCategoriasFinanceiras,
          dataFormasPagamento,
        ] = await Promise.all([
          apiService.getClientes(),
          apiService.getCategorias(),
          apiService.getCategoriasFinanceiras(),
          apiService.getFormasPagamento(),
        ]);

        setClientes(dataClientes || []);
        setCategorias(dataCategorias || []);
        setCategoriasFinanceiras(dataCategoriasFinanceiras || []);
        setFormasPagamento(dataFormasPagamento || []);
      } catch (e) {
        setError(e?.message || "Erro ao carregar os cadastros gerais");
      } finally {
        setLoading(false);
      }
    };

    carregarResumo();
  }, []);

  const contarAtivos = (lista) => (lista || []).filter((item) => item?.ativo !== false).length;
  const contarInativos = (lista) => (lista || []).filter((item) => item?.ativo === false).length;

  const cards = [
    {
      titulo: "Clientes",
      descricao: "Cadastre e gerencie pessoas físicas e jurídicas do sistema.",
      icone: <PeopleAltIcon fontSize="large" />,
      total: clientes.length,
      ativos: contarAtivos(clientes),
      inativos: contarInativos(clientes),
      rota: "/cadastros/clientes",
    },
    {
      titulo: "Categorias",
      descricao: "Organize os produtos do estoque por grupos e classificações.",
      icone: <CategoryIcon fontSize="large" />,
      total: categorias.length,
      ativos: contarAtivos(categorias),
      inativos: contarInativos(categorias),
      rota: "/cadastros/categorias",
    },
    {
      titulo: "Categorias Financeiras",
      descricao: "Defina categorias para receitas e despesas do financeiro.",
      icone: <AccountBalanceWalletIcon fontSize="large" />,
      total: categoriasFinanceiras.length,
      ativos: contarAtivos(categoriasFinanceiras),
      inativos: contarInativos(categoriasFinanceiras),
      rota: "/cadastros/categorias-financeiras",
    },
    {
      titulo: "Formas de Pagamento",
      descricao: "Gerencie os meios de pagamento aceitos pelo sistema.",
      icone: <PaymentsIcon fontSize="large" />,
      total: formasPagamento.length,
      ativos: contarAtivos(formasPagamento),
      inativos: contarInativos(formasPagamento),
      rota: "/cadastros/formas-pagamento",
    },
  ];

  return (
    <AppLayout title="Cadastros Gerais">
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Cadastros Gerais
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Escolha o tipo de cadastro que deseja acessar e gerenciar no sistema.
            </Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Paper sx={{ p: 6 }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">
                Carregando informações dos cadastros...
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} md={6} xl={3} key={card.titulo}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    transition: "0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "primary.main",
                        color: "#fff",
                      }}
                    >
                      {card.icone}
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {card.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {card.descricao}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label={`${card.total} cadastrados`} color="primary" variant="outlined" />
                      <Chip label={`${card.ativos} ativos`} color="success" variant="outlined" />
                      {card.inativos > 0 && (
                        <Chip label={`${card.inativos} inativos`} color="warning" variant="outlined" />
                      )}
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(card.rota)}
                      fullWidth
                    >
                      Acessar
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate(card.rota)}
                    >
                      Novo
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </AppLayout>
  );
}