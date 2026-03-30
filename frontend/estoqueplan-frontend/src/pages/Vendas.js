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
    Divider,
    Box,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";

import apiService from "../services/api";

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

const emptyItem = {
    categoriaId: "",
    produtoId: "",
    quantidade: 1,
    unidade: "un",
    bitola: "",
    comprimento: "",
    precoUnitario: "",
};

const emptyForm = {
    clienteId: "",
    rua: "",
    bairro: "",
    fone: "",
    observacao: "",
    desconto: "",
    adicional: "",
    frete: "",
    itens: [{ ...emptyItem }],

    categoriaFinanceiraId: "",
    formaPagamentoId: "",
    numeroParcelas: 1,
    primeiroVencimento: new Date().toISOString().split("T")[0],
    intervaloDias: 30,
    descricaoTitulo: "",
};

const emptyFilters = {
    busca: "",
    status: "TODAS",
    valorMin: "",
    valorMax: "",
    dataInicial: "",
    dataFinal: "",
};

export default function Vendas() {
    const [vendas, setVendas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [categoriasFinanceiras, setCategoriasFinanceiras] = useState([]);
    const [formasPagamento, setFormasPagamento] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [incluirCanceladas, setIncluirCanceladas] = useState(false);
    const [filters, setFilters] = useState(emptyFilters);

    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [openDetails, setOpenDetails] = useState(false);
    const [details, setDetails] = useState(null);

    const total = vendas.length;

    const totalCanceladas = useMemo(
        () => vendas.filter((v) => (v.status || "ATIVA") === "CANCELADA").length,
        [vendas]
    );

    const pageContentSx = {
        width: "100%",
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                vendasData,
                clientesData,
                categoriasData,
                produtosData,
                categoriasFinanceirasData,
                formasPagamentoData,
            ] = await Promise.all([
                apiService.getVendas(),
                apiService.getClientes(),
                apiService.getCategorias(),
                apiService
                    .getProdutos({ incluirInativos: false })
                    .catch(() => apiService.getProdutos()),
                apiService.getCategoriasFinanceiras(),
                apiService.getFormasPagamento(),
            ]);

            setVendas(vendasData || []);
            setClientes(clientesData || []);
            setCategorias(categoriasData || []);
            setCategoriasFinanceiras(categoriasFinanceirasData || []);
            setFormasPagamento(formasPagamentoData || []);

            const ativos = (produtosData || []).filter(
                (p) => (p.ativo ?? true) === true
            );
            setProdutos(ativos);
        } catch (e) {
            setError(e?.message || "Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getClienteById = (id) =>
        clientes.find((c) => Number(c.id) === Number(id));

    const getClienteNome = (clienteId) => {
        const c = getClienteById(clienteId);
        return c?.nome || "-";
    };

    const getProduto = (produtoId) =>
        produtos.find((p) => Number(p.id) === Number(produtoId));

    const statusChip = (v) => {
        const st = v.status || "ATIVA";
        return (
            <Chip
                size="small"
                label={st}
                color={st === "ATIVA" ? "success" : "default"}
                variant={st === "ATIVA" ? "filled" : "outlined"}
            />
        );
    };

    const vendasFiltradas = useMemo(() => {
        const busca = String(filters.busca || "").trim().toLowerCase();
        const valorMin = filters.valorMin === "" ? null : Number(filters.valorMin);
        const valorMax = filters.valorMax === "" ? null : Number(filters.valorMax);

        return [...vendas]
            .filter((v) => {
                const status = v.status || "ATIVA";
                return incluirCanceladas ? true : status === "ATIVA";
            })
            .filter((v) => {
                if (!busca) return true;

                const clienteNome = (v.nomeCliente || getClienteNome(v.clienteId) || "")
                    .toString()
                    .toLowerCase();

                const texto = `
          ${v.id || ""}
          ${clienteNome}
          ${v.observacao || ""}
          ${v.rua || ""}
          ${v.bairro || ""}
        `.toLowerCase();

                return texto.includes(busca);
            })
            .filter((v) => {
                if (filters.status === "TODAS") return true;
                return String(v.status || "ATIVA") === String(filters.status);
            })
            .filter((v) => {
                if (valorMin === null || Number.isNaN(valorMin)) return true;
                return Number(v.valorTotal || 0) >= valorMin;
            })
            .filter((v) => {
                if (valorMax === null || Number.isNaN(valorMax)) return true;
                return Number(v.valorTotal || 0) <= valorMax;
            })
            .filter((v) => {
                if (!filters.dataInicial) return true;
                const dataVenda = v.dataDaVenda ? new Date(v.dataDaVenda) : null;
                if (!dataVenda || Number.isNaN(dataVenda.getTime())) return false;

                const inicio = new Date(`${filters.dataInicial}T00:00:00`);
                return dataVenda >= inicio;
            })
            .filter((v) => {
                if (!filters.dataFinal) return true;
                const dataVenda = v.dataDaVenda ? new Date(v.dataDaVenda) : null;
                if (!dataVenda || Number.isNaN(dataVenda.getTime())) return false;

                const fim = new Date(`${filters.dataFinal}T23:59:59`);
                return dataVenda <= fim;
            })
            .sort(
                (a, b) => new Date(b.dataDaVenda || 0) - new Date(a.dataDaVenda || 0)
            );
    }, [vendas, incluirCanceladas, filters, clientes]);

    const handleClienteChange = (clienteId) => {
        const c = getClienteById(clienteId);

        setForm((f) => ({
            ...f,
            clienteId,
            fone: c?.telefone || f.fone || "",
            rua: c?.endereco || f.rua || "",
            bairro: f.bairro || "",
        }));
    };

    const calcItemTotal = (item) => {
        const qtd = Number(item.quantidade || 0);
        const pu = Number(item.precoUnitario || 0);
        if (Number.isNaN(qtd) || Number.isNaN(pu)) return 0;
        return qtd * pu;
    };

    const subtotal = useMemo(() => {
        return (form.itens || []).reduce((acc, it) => acc + calcItemTotal(it), 0);
    }, [form.itens]);

    const descontoNum = Number(form.desconto || 0) || 0;
    const adicionalNum = Number(form.adicional || 0) || 0;
    const freteNum = Number(form.frete || 0) || 0;

    const totalForm = useMemo(() => {
        return subtotal - descontoNum + adicionalNum + freteNum;
    }, [subtotal, descontoNum, adicionalNum, freteNum]);

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpenForm(true);
    };

    const openEdit = (v) => {
        const st = v.status || "ATIVA";
        if (st !== "ATIVA") {
            setError("Venda cancelada não pode ser editada.");
            return;
        }

        setEditing(v);

        setForm({
            clienteId: v.clienteId ?? "",
            rua: v.rua ?? "",
            bairro: v.bairro ?? "",
            fone: v.fone ?? "",
            observacao: v.observacao ?? "",
            desconto: v.desconto ?? "",
            adicional: v.adicional ?? "",
            frete: v.frete ?? "",
            itens: (v.itens || []).map((it) => {
                const prod = produtos.find((p) => Number(p.id) === Number(it.produtoId));
                return {
                    categoriaId: prod?.categoria?.id ?? "",
                    produtoId: it.produtoId ?? "",
                    quantidade: it.quantidade ?? 1,
                    unidade: it.unidade ?? "un",
                    bitola: it.bitola ?? "",
                    comprimento: it.comprimento ?? "",
                    precoUnitario: it.precoUnitario ?? "",
                };
            }),

            categoriaFinanceiraId: v.categoriaFinanceiraId ?? "",
            formaPagamentoId: v.formaPagamentoId ?? "",
            numeroParcelas: v.numeroParcelas ?? 1,
            primeiroVencimento:
                v.primeiroVencimento ?? new Date().toISOString().split("T")[0],
            intervaloDias: v.intervaloDias ?? 30,
            descricaoTitulo: v.descricaoTitulo ?? "",
        });

        setOpenForm(true);
    };

    const openView = (v) => {
        setDetails(v);
        setOpenDetails(true);
    };

    const closeView = () => {
        setOpenDetails(false);
        setDetails(null);
    };

    const addItem = () => {
        setForm((f) => ({
            ...f,
            itens: [...(f.itens || []), { ...emptyItem }],
        }));
    };

    const removeItem = (idx) => {
        setForm((f) => {
            const list = [...(f.itens || [])];
            list.splice(idx, 1);
            return { ...f, itens: list.length ? list : [{ ...emptyItem }] };
        });
    };

    const updateItem = (idx, patch) => {
        setForm((f) => {
            const list = [...(f.itens || [])];
            list[idx] = { ...list[idx], ...patch };
            return { ...f, itens: list };
        });
    };

    const produtosPorCategoria = (categoriaId) =>
        produtos.filter((p) => Number(p.categoria?.id) === Number(categoriaId));

    const handleCategoriaChange = (idx, categoriaId) => {
        updateItem(idx, {
            categoriaId,
            produtoId: "",
            unidade: "un",
            precoUnitario: "",
        });
    };

    const handleProdutoChange = (idx, produtoId) => {
        const prod = getProduto(produtoId);
        updateItem(idx, {
            produtoId,
            unidade: prod?.unidade || "un",
        });
    };

    const validateForm = () => {
        const clienteId = Number(form.clienteId);
        if (!clienteId) throw new Error("Selecione um cliente");

        const itens = form.itens || [];
        if (!itens.length) throw new Error("Adicione pelo menos 1 item");

        if (!Number(form.categoriaFinanceiraId)) {
            throw new Error("Selecione a categoria financeira");
        }

        if (!Number(form.formaPagamentoId)) {
            throw new Error("Selecione a forma de pagamento");
        }

        const parcelas = Number(form.numeroParcelas);
        if (!parcelas || parcelas <= 0) {
            throw new Error("Número de parcelas inválido");
        }

        if (!form.primeiroVencimento) {
            throw new Error("Informe o primeiro vencimento");
        }

        const intervalo = Number(form.intervaloDias);
        if (!intervalo || intervalo <= 0) {
            throw new Error("Intervalo entre parcelas inválido");
        }

        itens.forEach((it, i) => {
            if (!Number(it.categoriaId))
                throw new Error(`Selecione a categoria do item ${i + 1}`);
            if (!Number(it.produtoId))
                throw new Error(`Selecione o produto do item ${i + 1}`);

            const qtd = Number(it.quantidade);
            const pu = Number(it.precoUnitario);

            if (!qtd || qtd <= 0)
                throw new Error(`Quantidade inválida no item ${i + 1}`);
            if (Number.isNaN(pu) || pu <= 0)
                throw new Error(`Preço unitário inválido no item ${i + 1}`);
        });
    };

    const handleSave = async () => {
        try {
            setError("");
            validateForm();
            setLoading(true);

            const payload = {
                clienteId: Number(form.clienteId),
                rua: String(form.rua || "").trim(),
                bairro: String(form.bairro || "").trim(),
                fone: String(form.fone || "").trim(),
                observacao: String(form.observacao || "").trim(),
                desconto: form.desconto === "" ? 0 : Number(form.desconto || 0),
                adicional: form.adicional === "" ? 0 : Number(form.adicional || 0),
                frete: form.frete === "" ? 0 : Number(form.frete || 0),

                categoriaFinanceiraId: Number(form.categoriaFinanceiraId),
                formaPagamentoId: Number(form.formaPagamentoId),
                numeroParcelas: Number(form.numeroParcelas || 1),
                primeiroVencimento: form.primeiroVencimento,
                intervaloDias: Number(form.intervaloDias || 30),
                descricaoTitulo: String(form.descricaoTitulo || "").trim(),

                itens: (form.itens || []).map((it) => ({
                    produtoId: Number(it.produtoId),
                    quantidade: Number(it.quantidade),
                    unidade: String(it.unidade || "un").trim(),
                    bitola: String(it.bitola || "").trim(),
                    comprimento: String(it.comprimento || "").trim(),
                    precoUnitario: Number(it.precoUnitario),
                })),
            };

            let saved;
            if (editing?.id) {
                saved = await apiService.updateVenda(editing.id, payload);
                setVendas((prev) =>
                    prev.map((v) => (v.id === editing.id ? saved : v))
                );
            } else {
                saved = await apiService.createVenda(payload);
                setVendas((prev) => [saved, ...prev]);
            }

            handleCloseForm();
        } catch (e) {
            setError(e?.message || "Erro ao salvar venda");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (v) => {
        const st = v.status || "ATIVA";
        if (st !== "ATIVA") return;

        const motivo = window.prompt(
            `Cancelar a venda #${v.id}?\nVocê pode informar um motivo (opcional):`,
            ""
        );

        if (motivo === null) return;

        try {
            setError("");
            setLoading(true);

            await apiService.cancelarVenda(v.id, motivo || "");
            await loadData();
        } catch (e) {
            setError(e?.message || "Erro ao cancelar venda");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Vendas">
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
                                            Vendas cadastradas
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            {vendasFiltradas.length} de {total} venda(s) •{" "}
                                            {totalCanceladas} cancelada(s)
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
                                            Nova Venda
                                        </Button>

                                        <Button variant="contained">Importar</Button>
                                        <Button variant="contained">Exportar XLSX</Button>
                                        <Button variant="contained">Exportar PDF</Button>

                                        <FormControlLabel
                                            sx={{ ml: { xs: 0, lg: 1 } }}
                                            control={
                                                <Switch
                                                    checked={incluirCanceladas}
                                                    onChange={(e) =>
                                                        setIncluirCanceladas(e.target.checked)
                                                    }
                                                />
                                            }
                                            label="Incluir canceladas"
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
                                        xl: "minmax(260px,1.9fr) minmax(160px,1fr) minmax(140px,0.85fr) minmax(140px,0.85fr) minmax(170px,1fr) minmax(170px,1fr) auto",
                                    },
                                    gap: 2,
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    label="Buscar"
                                    placeholder="Cliente, observação ou nº da venda"
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
                                        <MenuItem value="TODAS">Todas</MenuItem>
                                        <MenuItem value="ATIVA">ATIVA</MenuItem>
                                        <MenuItem value="CANCELADA">CANCELADA</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Valor mín."
                                    type="number"
                                    value={filters.valorMin}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            valorMin: e.target.value,
                                        }))
                                    }
                                    inputProps={{ min: 0, step: 0.01 }}
                                    fullWidth
                                />

                                <TextField
                                    label="Valor máx."
                                    type="number"
                                    value={filters.valorMax}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            valorMax: e.target.value,
                                        }))
                                    }
                                    inputProps={{ min: 0, step: 0.01 }}
                                    fullWidth
                                />

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

                                <Button
                                    variant="text"
                                    onClick={() => setFilters(emptyFilters)}
                                    sx={{
                                        height: 56,
                                        minWidth: 100,
                                        whiteSpace: "nowrap",
                                        justifySelf: { xs: "start", xl: "center" },
                                    }}
                                >
                                    Limpar
                                </Button>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {error && (
                    <Grid item xs={12} sx={pageContentSx}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}

                <Grid item xs={12} sx={pageContentSx}>
                    <Paper
                        sx={{
                            p: 2,
                            minHeight: "72vh",
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
                                    height: "72vh",
                                    width: "100%",
                                }}
                            >
                                <Table stickyHeader size="small" sx={{ width: "100%" }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <b>#</b>
                                            </TableCell>
                                            <TableCell>
                                                <b>Data</b>
                                            </TableCell>
                                            <TableCell>
                                                <b>Cliente</b>
                                            </TableCell>
                                            <TableCell>
                                                <b>Itens</b>
                                            </TableCell>
                                            <TableCell align="right">
                                                <b>Total</b>
                                            </TableCell>
                                            <TableCell align="center">
                                                <b>Status</b>
                                            </TableCell>
                                            <TableCell align="center">
                                                <b>Ações</b>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {vendasFiltradas.map((v) => {
                                            const st = v.status || "ATIVA";
                                            const ativa = st === "ATIVA";
                                            const itensCount = (v.itens || []).length;

                                            return (
                                                <TableRow
                                                    key={v.id}
                                                    hover
                                                    sx={{ opacity: ativa ? 1 : 0.55 }}
                                                >
                                                    <TableCell>{v.id}</TableCell>
                                                    <TableCell>{dateTimeBR(v.dataDaVenda)}</TableCell>
                                                    <TableCell>
                                                        {v.nomeCliente || getClienteNome(v.clienteId)}
                                                    </TableCell>
                                                    <TableCell>{itensCount}</TableCell>
                                                    <TableCell align="right">
                                                        {money(v.valorTotal)}
                                                    </TableCell>
                                                    <TableCell align="center">{statusChip(v)}</TableCell>

                                                    <TableCell align="center">
                                                        <Tooltip title="Ver detalhes">
                                                            <IconButton onClick={() => openView(v)}>
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={ativa ? "Editar" : "Venda cancelada"}
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    onClick={() => openEdit(v)}
                                                                    disabled={!ativa}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={ativa ? "Cancelar venda" : "Já cancelada"}
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    color="warning"
                                                                    onClick={() => handleCancelar(v)}
                                                                    disabled={!ativa}
                                                                >
                                                                    <BlockIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                        {vendasFiltradas.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <Typography
                                                        align="center"
                                                        color="text.secondary"
                                                        py={3}
                                                    >
                                                        Nenhuma venda encontrada para os filtros informados
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
                open={openForm}
                onClose={handleCloseForm}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>
                    {editing ? `Editar Venda #${editing.id}` : "Nova Venda"}
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <FormControl
                                        fullWidth
                                        size="medium"
                                        sx={{
                                            width: "100%",
                                            minWidth: 420,
                                            flex: 1,
                                        }}
                                    >
                                        <InputLabel>Cliente</InputLabel>
                                        <Select
                                            label="Cliente"
                                            value={form.clienteId}
                                            onChange={(e) => handleClienteChange(e.target.value)}
                                            sx={{ width: "100%" }}
                                        >
                                            {clientes.map((c) => (
                                                <MenuItem key={c.id} value={c.id}>
                                                    {c.nome}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Telefone"
                                        value={form.fone}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, fone: e.target.value }))
                                        }
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <TextField
                                        label="Rua"
                                        value={form.rua}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, rua: e.target.value }))
                                        }
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Bairro"
                                        value={form.bairro}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, bairro: e.target.value }))
                                        }
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Observação"
                                        value={form.observacao}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, observacao: e.target.value }))
                                        }
                                        fullWidth
                                        multiline
                                        minRows={2}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Divider />

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                Itens da venda
                            </Typography>

                            <Button onClick={addItem} startIcon={<AddIcon />}>
                                Adicionar item
                            </Button>
                        </Stack>

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                {(form.itens || []).map((it, idx) => {
                                    const listaProdutos = it.categoriaId
                                        ? produtosPorCategoria(it.categoriaId)
                                        : [];
                                    const itemTotal = calcItemTotal(it);

                                    return (
                                        <Box
                                            key={idx}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: "rgba(0,0,0,0.03)",
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={4}>
                                                    <FormControl
                                                        fullWidth
                                                        size="medium"
                                                        sx={{ width: "100%", minWidth: 260, flex: 1 }}
                                                    >
                                                        <InputLabel>Categoria</InputLabel>
                                                        <Select
                                                            label="Categoria"
                                                            value={it.categoriaId}
                                                            onChange={(e) =>
                                                                handleCategoriaChange(idx, e.target.value)
                                                            }
                                                            sx={{ width: "100%" }}
                                                        >
                                                            {categorias.map((c) => (
                                                                <MenuItem key={c.id} value={c.id}>
                                                                    {c.nome}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} md={8}>
                                                    <FormControl
                                                        fullWidth
                                                        size="medium"
                                                        disabled={!it.categoriaId}
                                                        sx={{ width: "100%", minWidth: 520, flex: 2 }}
                                                    >
                                                        <InputLabel>Produto</InputLabel>
                                                        <Select
                                                            label="Produto"
                                                            value={it.produtoId}
                                                            onChange={(e) =>
                                                                handleProdutoChange(idx, e.target.value)
                                                            }
                                                            sx={{ width: "100%" }}
                                                        >
                                                            {listaProdutos.map((p) => (
                                                                <MenuItem key={p.id} value={p.id}>
                                                                    {p.descricao}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        label="Qtd"
                                                        type="number"
                                                        inputProps={{ min: 0 }}
                                                        value={it.quantidade}
                                                        onChange={(e) =>
                                                            updateItem(idx, { quantidade: e.target.value })
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        label="Un"
                                                        value={it.unidade}
                                                        onChange={(e) =>
                                                            updateItem(idx, { unidade: e.target.value })
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        label="Preço Unit."
                                                        type="number"
                                                        inputProps={{ min: 0, step: 0.01 }}
                                                        value={it.precoUnitario}
                                                        onChange={(e) =>
                                                            updateItem(idx, {
                                                                precoUnitario: e.target.value,
                                                            })
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total item
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                                            {money(itemTotal)}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <Button
                                                        color="error"
                                                        variant="outlined"
                                                        fullWidth
                                                        onClick={() => removeItem(idx)}
                                                    >
                                                        Remover
                                                    </Button>
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Bitola"
                                                        value={it.bitola}
                                                        onChange={(e) =>
                                                            updateItem(idx, { bitola: e.target.value })
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Comprimento"
                                                        value={it.comprimento}
                                                        onChange={(e) =>
                                                            updateItem(idx, { comprimento: e.target.value })
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Desconto"
                                        type="number"
                                        inputProps={{ min: 0, step: 0.01 }}
                                        value={form.desconto}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, desconto: e.target.value }))
                                        }
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Adicional"
                                        type="number"
                                        inputProps={{ min: 0, step: 0.01 }}
                                        value={form.adicional}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, adicional: e.target.value }))
                                        }
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Frete"
                                        type="number"
                                        inputProps={{ min: 0, step: 0.01 }}
                                        value={form.frete}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, frete: e.target.value }))
                                        }
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Subtotal: {money(subtotal)}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                            Total: {money(totalForm)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                    Financeiro / Pagamento
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <FormControl
                                            fullWidth
                                            size="medium"
                                            sx={{
                                                width: "100%",
                                                minWidth: 320,
                                                flex: 1,
                                            }}
                                        >
                                            <InputLabel>Categoria financeira</InputLabel>
                                            <Select
                                                label="Categoria financeira"
                                                value={form.categoriaFinanceiraId}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        categoriaFinanceiraId: e.target.value,
                                                    }))
                                                }
                                                sx={{ width: "100%" }}
                                            >
                                                {categoriasFinanceiras.map((cat) => (
                                                    <MenuItem key={cat.id} value={cat.id}>
                                                        {cat.nome}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <FormControl
                                            fullWidth
                                            size="medium"
                                            sx={{
                                                width: "100%",
                                                minWidth: 320,
                                                flex: 1,
                                            }}
                                        >
                                            <InputLabel>Forma de pagamento</InputLabel>
                                            <Select
                                                label="Forma de pagamento"
                                                value={form.formaPagamentoId}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        formaPagamentoId: e.target.value,
                                                    }))
                                                }
                                                sx={{ width: "100%" }}
                                            >
                                                {formasPagamento.map((fp) => (
                                                    <MenuItem key={fp.id} value={fp.id}>
                                                        {fp.tipo}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Descrição do título"
                                            value={form.descricaoTitulo}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    descricaoTitulo: e.target.value,
                                                }))
                                            }
                                            fullWidth
                                            sx={{
                                                width: "100%",
                                                minWidth: 320,
                                                flex: 1,
                                            }}
                                            placeholder="Ex: Venda balcão - cliente João"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Número de parcelas"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            value={form.numeroParcelas}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    numeroParcelas: e.target.value,
                                                }))
                                            }
                                            fullWidth
                                            sx={{
                                                width: "100%",
                                                minWidth: 200,
                                                flex: 1,
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Primeiro vencimento"
                                            type="date"
                                            value={form.primeiroVencimento}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    primeiroVencimento: e.target.value,
                                                }))
                                            }
                                            fullWidth
                                            sx={{
                                                width: "100%",
                                                minWidth: 220,
                                                flex: 1,
                                            }}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Intervalo entre parcelas (dias)"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            value={form.intervaloDias}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    intervaloDias: e.target.value,
                                                }))
                                            }
                                            fullWidth
                                            sx={{
                                                width: "100%",
                                                minWidth: 200,
                                                flex: 1,
                                            }}
                                            disabled={Number(form.numeroParcelas || 1) <= 1}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Paper>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseForm} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={loading}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetails} onClose={closeView} maxWidth="md" fullWidth>
                <DialogTitle>Detalhes da venda</DialogTitle>
                <DialogContent dividers>
                    {!details ? (
                        <Typography color="text.secondary">Nada para mostrar.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Venda
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        #{details.id}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Data
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {dateTimeBR(details.dataDaVenda)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    {statusChip(details)}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Cliente
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.nomeCliente || getClienteNome(details.clienteId)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Telefone
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.fone || "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Rua
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.rua || "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Bairro
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.bairro || "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Observação
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {details.observacao || "-"}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                Itens
                            </Typography>

                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <b>Produto</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>Bitola</b>
                                        </TableCell>
                                        <TableCell>
                                            <b>Comp.</b>
                                        </TableCell>
                                        <TableCell align="right">
                                            <b>Qtd</b>
                                        </TableCell>
                                        <TableCell align="right">
                                            <b>Preço Unit.</b>
                                        </TableCell>
                                        <TableCell align="right">
                                            <b>Total</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(details.itens || []).map((it, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                {it.descricaoProduto || `#${it.produtoId}`}
                                            </TableCell>
                                            <TableCell>{it.bitola || "-"}</TableCell>
                                            <TableCell>{it.comprimento || "-"}</TableCell>
                                            <TableCell align="right">{it.quantidade || 0}</TableCell>
                                            <TableCell align="right">
                                                {money(it.precoUnitario)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {money(
                                                    it.total ??
                                                    Number(it.quantidade || 0) *
                                                    Number(it.precoUnitario || 0)
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        Desconto
                                    </Typography>
                                    <Typography sx={{ fontWeight: 900 }}>
                                        {money(details.desconto)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        Adicional
                                    </Typography>
                                    <Typography sx={{ fontWeight: 900 }}>
                                        {money(details.adicional)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        Frete
                                    </Typography>
                                    <Typography sx={{ fontWeight: 900 }}>
                                        {money(details.frete)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                        {money(details.valorTotal)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                Financeiro
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Categoria financeira
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.categoriaFinanceiraId || "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Forma de pagamento
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.formaPagamentoId || "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Número de parcelas
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.numeroParcelas || "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Primeiro vencimento
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.primeiroVencimento || "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Intervalo entre parcelas
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.intervaloDias
                                            ? `${details.intervaloDias} dia(s)`
                                            : "-"}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Descrição do título
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.descricaoTitulo || "-"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeView}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </AppLayout>
    );
}