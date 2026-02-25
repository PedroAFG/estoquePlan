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
};

export default function Vendas() {
    const [vendas, setVendas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [produtos, setProdutos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [incluirCanceladas, setIncluirCanceladas] = useState(false);

    // modal criar/editar
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null); // venda ou null
    const [form, setForm] = useState(emptyForm);

    // modal detalhes
    const [openDetails, setOpenDetails] = useState(false);
    const [details, setDetails] = useState(null);

    const total = vendas.length;

    const totalCanceladas = useMemo(
        () => vendas.filter((v) => (v.status || "ATIVA") === "CANCELADA").length,
        [vendas]
    );

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [vendasData, clientesData, categoriasData, produtosData] =
                await Promise.all([
                    apiService.getVendas(),
                    apiService.getClientes(),
                    apiService.getCategorias(),
                    apiService.getProdutos({ incluirInativos: false }).catch(() =>
                        apiService.getProdutos()
                    ),
                ]);

            setVendas(vendasData || []);
            setClientes(clientesData || []);
            setCategorias(categoriasData || []);

            // garante só ativos no combo (segurança)
            const ativos = (produtosData || []).filter((p) => (p.ativo ?? true) === true);
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

    // filtro local (GET /vendas vem com tudo)
    const vendasFiltradas = useMemo(() => {
        const list = [...vendas];

        const filtered = incluirCanceladas
            ? list
            : list.filter((v) => (v.status || "ATIVA") === "ATIVA");

        // mais recentes primeiro
        filtered.sort(
            (a, b) => new Date(b.dataDaVenda || 0) - new Date(a.dataDaVenda || 0)
        );

        return filtered;
    }, [vendas, incluirCanceladas]);

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

    // ============
    // Cliente: auto preencher rua / fone
    // ============
    const handleClienteChange = (clienteId) => {
        const c = getClienteById(clienteId);

        setForm((f) => ({
            ...f,
            clienteId,
            // teu Cliente tem telefone e endereco (um campo só)
            fone: c?.telefone || f.fone || "",
            rua: c?.endereco || f.rua || "",
            // bairro não existe no ClienteDTO do swagger, então mantém o que tinha
            bairro: f.bairro || "",
        }));
    };

    // ============
    // Totais
    // ============
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

    // ============
    // Modal: abrir/fechar
    // ============
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

    // ============
    // Itens do form
    // ============
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
            // se quiser auto-preencher com preço sugerido:
            // precoUnitario: prod?.precoVarejo ?? "",
        });
    };

    // ============
    // Salvar / Cancelar venda
    // ============
    const validateForm = () => {
        const clienteId = Number(form.clienteId);
        if (!clienteId) throw new Error("Selecione um cliente");

        const itens = form.itens || [];
        if (!itens.length) throw new Error("Adicione pelo menos 1 item");

        itens.forEach((it, i) => {
            if (!Number(it.categoriaId)) throw new Error(`Selecione a categoria do item ${i + 1}`);
            if (!Number(it.produtoId)) throw new Error(`Selecione o produto do item ${i + 1}`);

            const qtd = Number(it.quantidade);
            const pu = Number(it.precoUnitario);

            if (!qtd || qtd <= 0) throw new Error(`Quantidade inválida no item ${i + 1}`);
            if (Number.isNaN(pu) || pu <= 0) throw new Error(`Preço unitário inválido no item ${i + 1}`);
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
                setVendas((prev) => prev.map((v) => (v.id === editing.id ? saved : v)));
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

            // PATCH pode não voltar body → recarrega
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
                {/* Header */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            {/* Lado esquerdo */}
                            <Grid item xs={12} md={6}>
                                <Stack spacing={1}>
                                    <Typography variant="h6">Vendas</Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {total} venda(s) • {totalCanceladas} cancelada(s)
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={openCreate}
                                        sx={{ width: "fit-content" }}
                                    >
                                        Nova Venda
                                    </Button>

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={incluirCanceladas}
                                                onChange={(e) => setIncluirCanceladas(e.target.checked)}
                                            />
                                        }
                                        label="Incluir canceladas"
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
                    <Paper sx={{ p: 2, minHeight: "72vh" }}>
                        {loading ? (
                            <Stack alignItems="center" py={6}>
                                <CircularProgress />
                            </Stack>
                        ) : (
                            <TableContainer sx={{ height: "72vh" }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>#</b></TableCell>
                                            <TableCell><b>Data</b></TableCell>
                                            <TableCell><b>Cliente</b></TableCell>
                                            <TableCell><b>Itens</b></TableCell>
                                            <TableCell align="right"><b>Total</b></TableCell>
                                            <TableCell align="center"><b>Status</b></TableCell>
                                            <TableCell align="center"><b>Ações</b></TableCell>
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
                                                    <TableCell align="right">{money(v.valorTotal)}</TableCell>
                                                    <TableCell align="center">{statusChip(v)}</TableCell>

                                                    <TableCell align="center">
                                                        <Tooltip title="Ver detalhes">
                                                            <IconButton onClick={() => openView(v)}>
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title={ativa ? "Editar" : "Venda cancelada"}>
                                                            <span>
                                                                <IconButton onClick={() => openEdit(v)} disabled={!ativa}>
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>

                                                        <Tooltip title={ativa ? "Cancelar venda" : "Já cancelada"}>
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
                                                    <Typography align="center" color="text.secondary" py={3}>
                                                        Nenhuma venda encontrada
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

            {/* Modal Criar/Editar */}
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
                        {/* Dados do cliente */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <FormControl
                                        fullWidth
                                        size="medium"
                                        sx={{
                                            width: "100%",
                                            minWidth: 420,        // 👈 força ficar grande
                                            flex: 1,              // 👈 se tiver flex, ele expande
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
                                        onChange={(e) => setForm((f) => ({ ...f, fone: e.target.value }))}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <TextField
                                        label="Rua"
                                        value={form.rua}
                                        onChange={(e) => setForm((f) => ({ ...f, rua: e.target.value }))}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Bairro"
                                        value={form.bairro}
                                        onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Observação"
                                        value={form.observacao}
                                        onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Divider />

                        {/* Itens */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                                                {/* Categoria */}
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
                                                            onChange={(e) => handleCategoriaChange(idx, e.target.value)}
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

                                                {/* Produto */}
                                                <Grid item xs={12} md={8}>
                                                    <FormControl
                                                        fullWidth
                                                        size="medium"
                                                        disabled={!it.categoriaId}
                                                        sx={{ width: "100%", minWidth: 520, flex: 2 }}  // 👈 bem maior que categoria
                                                    >
                                                        <InputLabel>Produto</InputLabel>
                                                        <Select
                                                            label="Produto"
                                                            value={it.produtoId}
                                                            onChange={(e) => handleProdutoChange(idx, e.target.value)}
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

                                                {/* Qtd / Un / Preço / Total / Remover */}
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
                                                            updateItem(idx, { precoUnitario: e.target.value })
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

                                                {/* Bitola / Comprimento */}
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

                        {/* Totais */}
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

            {/* Modal Detalhes */}
            <Dialog open={openDetails} onClose={closeView} maxWidth="md" fullWidth>
                <DialogTitle>Detalhes da venda</DialogTitle>
                <DialogContent dividers>
                    {!details ? (
                        <Typography color="text.secondary">Nada para mostrar.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Venda</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>#{details.id}</Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Data</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {dateTimeBR(details.dataDaVenda)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    {statusChip(details)}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">Cliente</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {details.nomeCliente || getClienteNome(details.clienteId)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">Telefone</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>{details.fone || "-"}</Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">Rua</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>{details.rua || "-"}</Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">Bairro</Typography>
                                    <Typography sx={{ fontWeight: 800 }}>{details.bairro || "-"}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Observação</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{details.observacao || "-"}</Typography>
                                </Grid>
                            </Grid>

                            <Divider />

                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                Itens
                            </Typography>

                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Produto</b></TableCell>
                                        <TableCell><b>Bitola</b></TableCell>
                                        <TableCell><b>Comp.</b></TableCell>
                                        <TableCell align="right"><b>Qtd</b></TableCell>
                                        <TableCell align="right"><b>Preço Unit.</b></TableCell>
                                        <TableCell align="right"><b>Total</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(details.itens || []).map((it, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{it.descricaoProduto || `#${it.produtoId}`}</TableCell>
                                            <TableCell>{it.bitola || "-"}</TableCell>
                                            <TableCell>{it.comprimento || "-"}</TableCell>
                                            <TableCell align="right">{it.quantidade || 0}</TableCell>
                                            <TableCell align="right">{money(it.precoUnitario)}</TableCell>
                                            <TableCell align="right">
                                                {money(it.total ?? (Number(it.quantidade || 0) * Number(it.precoUnitario || 0)))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">Desconto</Typography>
                                    <Typography sx={{ fontWeight: 900 }}>{money(details.desconto)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">Adicional</Typography>
                                    <Typography sx={{ fontWeight: 900 }}>{money(details.adicional)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">Frete</Typography>
                                    <Typography sx={{ fontWeight: 900 }}>{money(details.frete)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="body2" color="text.secondary">Total</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                        {money(details.valorTotal)}
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