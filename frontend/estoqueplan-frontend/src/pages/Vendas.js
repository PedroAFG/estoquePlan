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
    FormHelperText,
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

import {
    money,
    dateTimeBR,
    buildVendaParaImpressao,
    gerarHtmlComprovanteVenda,
    imprimirHtml,
} from "../utils/vendaPrint";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import apiService from "../services/api";

const emptyItem = {
    categoriaId: "",
    produtoId: "",
    quantidade: "",
    unidade: "un",
    bitola: "",
    comprimento: "",
    precoUnitario: "",
};

const emptyItemErrors = {
    categoriaId: "",
    produtoId: "",
    quantidade: "",
    unidade: "",
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

const emptyFormErrors = {
    clienteId: "",
    rua: "",
    bairro: "",
    fone: "",
    observacao: "",
    desconto: "",
    adicional: "",
    frete: "",
    categoriaFinanceiraId: "",
    formaPagamentoId: "",
    numeroParcelas: "",
    primeiroVencimento: "",
    intervaloDias: "",
    descricaoTitulo: "",
    itens: [{ ...emptyItemErrors }],
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

    const [openPrintPrompt, setOpenPrintPrompt] = useState(false);
    const [saleToPrint, setSaleToPrint] = useState(null);

    const [loading, setLoading] = useState(true);

    const [pageError, setPageError] = useState("");
    const [pageSuccess, setPageSuccess] = useState("");
    const [formError, setFormError] = useState("");
    const [detailsError, setDetailsError] = useState("");

    const [incluirCanceladas, setIncluirCanceladas] = useState(false);
    const [filters, setFilters] = useState(emptyFilters);

    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState(emptyFormErrors);

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
            setPageError("");

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
            setPageError(e?.message || "Erro ao carregar dados");
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

    const buildEmptyItemErrorsList = (itens) =>
        (itens || []).map(() => ({ ...emptyItemErrors }));

    const handleCloseForm = () => {
        setOpenForm(false);
        setEditing(null);
        setForm(emptyForm);
        setFormErrors(emptyFormErrors);
        setFormError("");
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormErrors(emptyFormErrors);
        setFormError("");
        setOpenForm(true);
    };

    const openEdit = (v) => {
        const st = v.status || "ATIVA";
        if (st !== "ATIVA") {
            setPageError("Venda cancelada não pode ser editada.");
            return;
        }

        const itensForm = (v.itens || []).map((it) => {
            const prod = produtos.find((p) => Number(p.id) === Number(it.produtoId));
            return {
                categoriaId: prod?.categoria?.id ?? "",
                produtoId: it.produtoId ?? "",
                quantidade: it.quantidade ?? "",
                unidade: it.unidade ?? "un",
                bitola: it.bitola ?? "",
                comprimento: it.comprimento ?? "",
                precoUnitario: it.precoUnitario ?? "",
            };
        });

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
            itens: itensForm.length ? itensForm : [{ ...emptyItem }],

            categoriaFinanceiraId: v.categoriaFinanceiraId ?? "",
            formaPagamentoId: v.formaPagamentoId ?? "",
            numeroParcelas: v.numeroParcelas ?? 1,
            primeiroVencimento:
                v.primeiroVencimento ?? new Date().toISOString().split("T")[0],
            intervaloDias: v.intervaloDias ?? 30,
            descricaoTitulo: v.descricaoTitulo ?? "",
        });

        setFormErrors({
            ...emptyFormErrors,
            itens: buildEmptyItemErrorsList(
                itensForm.length ? itensForm : [{ ...emptyItem }]
            ),
        });

        setFormError("");
        setOpenForm(true);
    };

    const openView = (v) => {
        setDetailsError("");
        setDetails(v);
        setOpenDetails(true);
    };

    const closeView = () => {
        setOpenDetails(false);
        setDetails(null);
        setDetailsError("");
    };

    const updateFormField = (campo, valor) => {
        setForm((prev) => ({
            ...prev,
            [campo]: valor,
        }));

        setFormErrors((prev) => ({
            ...prev,
            [campo]: "",
        }));

        setFormError("");
        setPageSuccess("");
    };

    const updateItemField = (idx, campo, valor) => {
        setForm((prev) => {
            const itens = [...(prev.itens || [])];
            const itemAtual = {
                ...itens[idx],
                [campo]: valor,
            };
            itens[idx] = itemAtual;

            return {
                ...prev,
                itens,
            };
        });

        setFormErrors((prev) => {
            const itensErrors = [...(prev.itens || [])];
            const erroAtual = {
                ...(itensErrors[idx] || { ...emptyItemErrors }),
                [campo]: "",
            };

            const itemBase = form.itens?.[idx] || {};
            const itemComNovoValor = {
                ...itemBase,
                [campo]: valor,
            };

            if (campo === "quantidade" || campo === "produtoId") {
                const produto = getProduto(itemComNovoValor.produtoId);
                const estoqueDisponivel = Number(produto?.quantidadeDisponivel ?? 0);
                const quantidadeDigitada = Number(itemComNovoValor.quantidade);

                if (String(itemComNovoValor.quantidade).trim() === "") {
                    erroAtual.quantidade = "";
                } else if (
                    Number.isNaN(quantidadeDigitada) ||
                    quantidadeDigitada <= 0
                ) {
                    erroAtual.quantidade = "Quantidade inválida.";
                } else if (quantidadeDigitada > estoqueDisponivel) {
                    erroAtual.quantidade = `Quantidade maior que o estoque disponível (${estoqueDisponivel}).`;
                } else {
                    erroAtual.quantidade = "";
                }
            }

            itensErrors[idx] = erroAtual;

            return {
                ...prev,
                itens: itensErrors,
            };
        });

        setFormError("");
        setPageSuccess("");
    };

    const handleClienteChange = (clienteId) => {
        const c = getClienteById(clienteId);

        setForm((f) => ({
            ...f,
            clienteId,
            fone: c?.telefone || "",
            rua: c?.endereco || "",
            bairro: f.bairro || "",
        }));

        setFormErrors((prev) => ({
            ...prev,
            clienteId: "",
        }));

        setFormError("");
        setPageSuccess("");
    };

    const addItem = () => {
        setForm((f) => ({
            ...f,
            itens: [...(f.itens || []), { ...emptyItem }],
        }));

        setFormErrors((prev) => ({
            ...prev,
            itens: [...(prev.itens || []), { ...emptyItemErrors }],
        }));

        setFormError("");
    };

    const removeItem = (idx) => {
        setForm((f) => {
            const list = [...(f.itens || [])];
            list.splice(idx, 1);
            return { ...f, itens: list.length ? list : [{ ...emptyItem }] };
        });

        setFormErrors((prev) => {
            const list = [...(prev.itens || [])];
            list.splice(idx, 1);
            return {
                ...prev,
                itens: list.length ? list : [{ ...emptyItemErrors }],
            };
        });

        setFormError("");
    };

    const produtosPorCategoria = (categoriaId) =>
        produtos.filter((p) => Number(p.categoria?.id) === Number(categoriaId));

    const handleCategoriaChange = (idx, categoriaId) => {
        setForm((prev) => {
            const itens = [...(prev.itens || [])];
            itens[idx] = {
                ...itens[idx],
                categoriaId,
                produtoId: "",
                unidade: "un",
                precoUnitario: "",
                quantidade: "",
                bitola: "",
                comprimento: "",
            };
            return {
                ...prev,
                itens,
            };
        });

        setFormErrors((prev) => {
            const itensErrors = [...(prev.itens || [])];
            itensErrors[idx] = {
                ...(itensErrors[idx] || { ...emptyItemErrors }),
                categoriaId: "",
                produtoId: "",
                precoUnitario: "",
                quantidade: "",
            };
            return {
                ...prev,
                itens: itensErrors,
            };
        });

        setFormError("");
        setPageSuccess("");
    };

    const handleProdutoChange = (idx, produtoId) => {
        const prod = getProduto(produtoId);

        setForm((prev) => {
            const itens = [...(prev.itens || [])];
            const quantidadeAtual = itens[idx]?.quantidade ?? "";

            itens[idx] = {
                ...itens[idx],
                produtoId,
                unidade: prod?.unidade || "un",
                precoUnitario:
                    prod?.precoVarejo !== undefined && prod?.precoVarejo !== null
                        ? String(prod.precoVarejo)
                        : "",
                quantidade: quantidadeAtual,
            };

            return {
                ...prev,
                itens,
            };
        });

        setFormErrors((prev) => {
            const itensErrors = [...(prev.itens || [])];
            const quantidadeAtual = form.itens?.[idx]?.quantidade ?? "";
            const estoqueDisponivel = Number(prod?.quantidadeDisponivel ?? 0);
            const quantidadeNum = Number(quantidadeAtual);

            let quantidadeErro = "";

            if (
                String(quantidadeAtual).trim() !== "" &&
                !Number.isNaN(quantidadeNum) &&
                quantidadeNum > estoqueDisponivel
            ) {
                quantidadeErro = `Quantidade maior que o estoque disponível (${estoqueDisponivel}).`;
            }

            itensErrors[idx] = {
                ...(itensErrors[idx] || { ...emptyItemErrors }),
                produtoId: "",
                precoUnitario: "",
                quantidade: quantidadeErro,
            };

            return {
                ...prev,
                itens: itensErrors,
            };
        });

        setFormError("");
        setPageSuccess("");
    };

    const validateForm = () => {
        const novosErros = {
            clienteId: "",
            telefone: "",
            rua: "",
            bairro: "",
            fone: "",
            observacao: "",
            desconto: "",
            adicional: "",
            frete: "",
            categoriaFinanceiraId: "",
            formaPagamentoId: "",
            numeroParcelas: "",
            primeiroVencimento: "",
            intervaloDias: "",
            descricaoTitulo: "",
            itens: (form.itens || []).map(() => ({ ...emptyItemErrors })),
        };

        const clienteId = Number(form.clienteId);
        const categoriaFinanceiraId = Number(form.categoriaFinanceiraId);
        const formaPagamentoId = Number(form.formaPagamentoId);
        const numeroParcelas = Number(form.numeroParcelas);
        const primeiroVencimento = String(form.primeiroVencimento || "").trim();
        const intervaloDias = Number(form.intervaloDias);

        if (!clienteId) {
            novosErros.clienteId = "Selecione um cliente.";
        }

        if (!categoriaFinanceiraId) {
            novosErros.categoriaFinanceiraId = "Selecione a categoria financeira.";
        }

        if (!formaPagamentoId) {
            novosErros.formaPagamentoId = "Selecione a forma de pagamento.";
        }

        if (!numeroParcelas || numeroParcelas <= 0) {
            novosErros.numeroParcelas = "Informe um número de parcelas válido.";
        }

        if (!primeiroVencimento) {
            novosErros.primeiroVencimento = "Informe o primeiro vencimento.";
        }

        if (!intervaloDias || intervaloDias <= 0) {
            novosErros.intervaloDias = "Informe um intervalo válido.";
        }

        const itens = form.itens || [];
        if (!itens.length) {
            novosErros.itens = [{ ...emptyItemErrors }];
            setFormErrors(novosErros);
            setFormError("Adicione pelo menos 1 item.");
            return false;
        }

        itens.forEach((it, i) => {
            const categoriaId = Number(it.categoriaId);
            const produtoId = Number(it.produtoId);
            const quantidadeRaw = String(it.quantidade ?? "").trim();
            const precoUnitarioRaw = String(it.precoUnitario ?? "").trim();
            const produtoSelecionado = getProduto(produtoId);
            const estoqueDisponivel = Number(produtoSelecionado?.quantidadeDisponivel ?? 0);

            const quantidade = Number(quantidadeRaw);
            const precoUnitario = Number(precoUnitarioRaw);

            if (!categoriaId) {
                novosErros.itens[i].categoriaId = "Selecione a categoria.";
            }

            if (!produtoId) {
                novosErros.itens[i].produtoId = "Selecione o produto.";
            }

            if (quantidadeRaw === "") {
                novosErros.itens[i].quantidade = "Informe a quantidade.";
            } else if (Number.isNaN(quantidade) || quantidade <= 0) {
                novosErros.itens[i].quantidade = "Quantidade inválida.";
            } else if (produtoId && quantidade > estoqueDisponivel) {
                novosErros.itens[i].quantidade = `Quantidade maior que o estoque disponível (${estoqueDisponivel}).`;
            }

            if (!String(it.unidade || "").trim()) {
                novosErros.itens[i].unidade = "Informe a unidade.";
            }

            if (precoUnitarioRaw === "") {
                novosErros.itens[i].precoUnitario = "Informe o preço unitário.";
            } else if (Number.isNaN(precoUnitario) || precoUnitario <= 0) {
                novosErros.itens[i].precoUnitario = "Preço unitário inválido.";
            }
        });

        setFormErrors(novosErros);

        const hasTopErrors = Object.entries(novosErros)
            .filter(([key]) => key !== "itens")
            .some(([, value]) => Boolean(value));

        const hasItemErrors = (novosErros.itens || []).some((itemErr) =>
            Object.values(itemErr).some(Boolean)
        );

        if (hasTopErrors || hasItemErrors) {
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        try {
            setFormError("");

            const isValid = validateForm();
            if (!isValid) {
                if (!formError) {
                    setFormError("Revise os campos obrigatórios da venda.");
                }
                return;
            }

            setLoading(true);

            const payload = {
                clienteId: Number(form.clienteId),
                rua: String(form.rua || "").trim(),
                bairro: String(form.bairro || "").trim(),
                fone: String(form.fone || "").trim(),
                observacao: String(form.observacao || "").trim(),
                desconto: form.desconto === "" ? 0 : Number(form.desconto),
                adicional: form.adicional === "" ? 0 : Number(form.adicional),
                frete: form.frete === "" ? 0 : Number(form.frete),

                categoriaFinanceiraId: Number(form.categoriaFinanceiraId),
                formaPagamentoId: Number(form.formaPagamentoId),
                numeroParcelas: Number(form.numeroParcelas),
                primeiroVencimento: form.primeiroVencimento,
                intervaloDias: Number(form.intervaloDias),
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
                setPageSuccess("Venda atualizada com sucesso.");
            } else {
                saved = await apiService.createVenda(payload);
                setVendas((prev) => [saved, ...prev]);
                setPageSuccess("Venda criada com sucesso.");

                const vendaParaPrompt = buildVendaParaImpressao({
                    ...saved,
                    ...payload,
                    valorTotal:
                        saved?.valorTotal ??
                        payload.itens.reduce(
                            (acc, it) => acc + Number(it.quantidade || 0) * Number(it.precoUnitario || 0),
                            0
                        ) -
                        Number(payload.desconto || 0) +
                        Number(payload.adicional || 0) +
                        Number(payload.frete || 0),
                    dataDaVenda: saved?.dataDaVenda || new Date().toISOString(),
                    status: saved?.status || "ATIVA",
                });

                setSaleToPrint(vendaParaPrompt);
                setOpenPrintPrompt(true);
            }

            handleCloseForm();
        } catch (e) {
            setFormError(e?.message || "Erro ao salvar venda");
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
            setPageError("");
            setPageSuccess("");
            setLoading(true);

            await apiService.cancelarVenda(v.id, motivo || "");
            await loadData();
            setPageSuccess("Venda cancelada com sucesso.");
        } catch (e) {
            setPageError(e?.message || "Erro ao cancelar venda");
        } finally {
            setLoading(false);
        }
    };

    const clienteSelectSx = {
        width: "100%",
        minWidth: 280,
    };

    const categoriaSelectSx = {
        width: "100%",
        minWidth: 220,
    };

    const produtoSelectSx = {
        width: "100%",
        minWidth: 420,
    };

    const financeiroSelectSx = {
        width: "100%",
        minWidth: 280,
    };

    const selectInputSx = {
        width: "100%",
    };

    const getCategoriaFinanceiraNome = (id) => {
        const cat = categoriasFinanceiras.find((c) => Number(c.id) === Number(id));
        return cat?.nome || "-";
    };

    const getFormaPagamentoNome = (id) => {
        const fp = formasPagamento.find((f) => Number(f.id) === Number(id));
        return fp?.tipo || "-";
    };

    const handlePrintVenda = (vendaRaw) => {
        const venda = buildVendaParaImpressao(vendaRaw, {
            getClienteById,
            getProdutoById: getProduto,
            getCategoriaFinanceiraNome,
            getFormaPagamentoNome,
            getCategoriaProdutoNome: (categoriaId) => {
                const categoria = categorias.find((c) => Number(c.id) === Number(categoriaId));
                return categoria?.nome || "-";
            },
        });

        const html = gerarHtmlComprovanteVenda(venda);

        imprimirHtml(html, () => {
            setPageError(
                "Não foi possível abrir a janela de impressão. Verifique se o navegador bloqueou pop-ups."
            );
        });
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

                {pageSuccess && (
                    <Grid item xs={12} sx={pageContentSx}>
                        <Alert severity="success" onClose={() => setPageSuccess("")}>
                            {pageSuccess}
                        </Alert>
                    </Grid>
                )}

                {pageError && (
                    <Grid item xs={12} sx={pageContentSx}>
                        <Alert severity="error" onClose={() => setPageError("")}>
                            {pageError}
                        </Alert>
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

                                                        <Tooltip title="Imprimir venda">
                                                            <IconButton onClick={() => handlePrintVenda(v)}>
                                                                <PrintIcon />
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
                        {formError && (
                            <Alert severity="error" onClose={() => setFormError("")}>
                                {formError}
                            </Alert>
                        )}

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <FormControl
                                        fullWidth
                                        size="medium"
                                        error={!!formErrors.clienteId}
                                        sx={clienteSelectSx}
                                    >
                                        <InputLabel>Cliente</InputLabel>
                                        <Select
                                            label="Cliente"
                                            value={form.clienteId}
                                            onChange={(e) => handleClienteChange(e.target.value)}
                                            sx={selectInputSx}
                                        >
                                            {clientes.map((c) => (
                                                <MenuItem key={c.id} value={c.id}>
                                                    {c.nome}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>{formErrors.clienteId}</FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Telefone"
                                        value={form.fone}
                                        onChange={(e) =>
                                            updateFormField("fone", e.target.value)
                                        }
                                        error={!!formErrors.fone}
                                        helperText={formErrors.fone}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Rua"
                                        value={form.rua}
                                        onChange={(e) => updateFormField("rua", e.target.value)}
                                        error={!!formErrors.rua}
                                        helperText={formErrors.rua}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Bairro"
                                        value={form.bairro}
                                        onChange={(e) => updateFormField("bairro", e.target.value)}
                                        error={!!formErrors.bairro}
                                        helperText={formErrors.bairro}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <TextField
                                        label="Observação"
                                        value={form.observacao}
                                        onChange={(e) => updateFormField("observacao", e.target.value)}
                                        error={!!formErrors.observacao}
                                        helperText={formErrors.observacao}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        maxRows={3}
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
                                    const produtoSelecionado = getProduto(it.produtoId);
                                    const itemTotal = calcItemTotal(it);
                                    const itemError = formErrors.itens?.[idx] || emptyItemErrors;
                                    const estoqueDisponivel = Number(
                                        produtoSelecionado?.quantidadeDisponivel ?? 0
                                    );

                                    return (
                                        <Box
                                            key={idx}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                bgcolor: "background.paper",
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="flex-start">
                                                <Grid item xs={12} md={3}>
                                                    <FormControl
                                                        fullWidth
                                                        error={!!itemError.categoriaId}
                                                        sx={categoriaSelectSx}
                                                    >
                                                        <InputLabel>Categoria</InputLabel>
                                                        <Select
                                                            label="Categoria"
                                                            value={it.categoriaId}
                                                            onChange={(e) =>
                                                                handleCategoriaChange(idx, e.target.value)
                                                            }
                                                            sx={selectInputSx}
                                                        >
                                                            {categorias.map((c) => (
                                                                <MenuItem key={c.id} value={c.id}>
                                                                    {c.nome}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        <FormHelperText sx={{ minHeight: 20 }}>
                                                            {itemError.categoriaId || " "}
                                                        </FormHelperText>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <FormControl
                                                        fullWidth
                                                        error={!!itemError.produtoId}
                                                        disabled={!it.categoriaId}
                                                        sx={produtoSelectSx}
                                                    >
                                                        <InputLabel>Produto</InputLabel>
                                                        <Select
                                                            label="Produto"
                                                            value={it.produtoId}
                                                            onChange={(e) =>
                                                                handleProdutoChange(idx, e.target.value)
                                                            }
                                                            sx={selectInputSx}
                                                        >
                                                            {listaProdutos.map((p) => {
                                                                const estoque = Number(p.quantidadeDisponivel ?? 0);
                                                                const semEstoque = estoque <= 0;

                                                                return (
                                                                    <MenuItem
                                                                        key={p.id}
                                                                        value={p.id}
                                                                        disabled={semEstoque}
                                                                    >
                                                                        {p.descricao} — {money(p.precoVarejo)} — Estoque: {estoque}
                                                                    </MenuItem>
                                                                );
                                                            })}
                                                        </Select>
                                                        <FormHelperText sx={{ minHeight: 20 }}>
                                                            {itemError.produtoId ||
                                                                (produtoSelecionado
                                                                    ? `Estoque disponível: ${estoqueDisponivel}`
                                                                    : " ")}
                                                        </FormHelperText>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        label="Qtd"
                                                        type="number"
                                                        value={it.quantidade}
                                                        onChange={(e) =>
                                                            updateItemField(idx, "quantidade", e.target.value)
                                                        }
                                                        error={!!itemError.quantidade}
                                                        helperText={itemError.quantidade || " "}
                                                        FormHelperTextProps={{ sx: { minHeight: 20 } }}
                                                        inputProps={{
                                                            min: 1,
                                                            max: estoqueDisponivel || undefined,
                                                        }}
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        label="Un"
                                                        value={it.unidade}
                                                        onChange={(e) =>
                                                            updateItemField(idx, "unidade", e.target.value)
                                                        }
                                                        error={!!itemError.unidade}
                                                        helperText={itemError.unidade || " "}
                                                        FormHelperTextProps={{ sx: { minHeight: 20 } }}
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
                                                            updateItemField(idx, "precoUnitario", e.target.value)
                                                        }
                                                        error={!!itemError.precoUnitario}
                                                        helperText={itemError.precoUnitario || " "}
                                                        FormHelperTextProps={{ sx: { minHeight: 20 } }}
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            height: 56,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Total item
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                                            {money(itemTotal)}
                                                        </Typography>
                                                    </Paper>
                                                    <Box sx={{ minHeight: 20 }} />
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        label="Bitola"
                                                        value={it.bitola}
                                                        onChange={(e) =>
                                                            updateItemField(idx, "bitola", e.target.value)
                                                        }
                                                        error={!!itemError.bitola}
                                                        helperText={itemError.bitola || " "}
                                                        FormHelperTextProps={{ sx: { minHeight: 20 } }}
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <TextField
                                                        label="Comprimento"
                                                        value={it.comprimento}
                                                        onChange={(e) =>
                                                            updateItemField(idx, "comprimento", e.target.value)
                                                        }
                                                        error={!!itemError.comprimento}
                                                        helperText={itemError.comprimento || " "}
                                                        FormHelperTextProps={{ sx: { minHeight: 20 } }}
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={2}>
                                                    <Button
                                                        color="error"
                                                        variant="outlined"
                                                        fullWidth
                                                        sx={{ height: 56 }}
                                                        onClick={() => removeItem(idx)}
                                                    >
                                                        Remover
                                                    </Button>
                                                    <Box sx={{ minHeight: 20 }} />
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
                                            updateFormField("desconto", e.target.value)
                                        }
                                        error={!!formErrors.desconto}
                                        helperText={formErrors.desconto}
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
                                            updateFormField("adicional", e.target.value)
                                        }
                                        error={!!formErrors.adicional}
                                        helperText={formErrors.adicional}
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
                                            updateFormField("frete", e.target.value)
                                        }
                                        error={!!formErrors.frete}
                                        helperText={formErrors.frete}
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
                                            error={!!formErrors.categoriaFinanceiraId}
                                            sx={financeiroSelectSx}
                                        >
                                            <InputLabel>Categoria financeira</InputLabel>
                                            <Select
                                                label="Categoria financeira"
                                                value={form.categoriaFinanceiraId}
                                                onChange={(e) =>
                                                    updateFormField(
                                                        "categoriaFinanceiraId",
                                                        e.target.value
                                                    )
                                                }
                                                sx={selectInputSx}
                                            >
                                                {categoriasFinanceiras.map((cat) => (
                                                    <MenuItem key={cat.id} value={cat.id}>
                                                        {cat.nome}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>
                                                {formErrors.categoriaFinanceiraId}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <FormControl
                                            fullWidth
                                            size="medium"
                                            error={!!formErrors.formaPagamentoId}
                                            sx={financeiroSelectSx}
                                        >
                                            <InputLabel>Forma de pagamento</InputLabel>
                                            <Select
                                                label="Forma de pagamento"
                                                value={form.formaPagamentoId}
                                                onChange={(e) =>
                                                    updateFormField(
                                                        "formaPagamentoId",
                                                        e.target.value
                                                    )
                                                }
                                                sx={selectInputSx}
                                            >
                                                {formasPagamento.map((fp) => (
                                                    <MenuItem key={fp.id} value={fp.id}>
                                                        {fp.tipo}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>
                                                {formErrors.formaPagamentoId}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Descrição do título"
                                            value={form.descricaoTitulo}
                                            onChange={(e) =>
                                                updateFormField(
                                                    "descricaoTitulo",
                                                    e.target.value
                                                )
                                            }
                                            error={!!formErrors.descricaoTitulo}
                                            helperText={formErrors.descricaoTitulo}
                                            fullWidth
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
                                                updateFormField(
                                                    "numeroParcelas",
                                                    e.target.value
                                                )
                                            }
                                            error={!!formErrors.numeroParcelas}
                                            helperText={formErrors.numeroParcelas}
                                            fullWidth
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            label="Primeiro vencimento"
                                            type="date"
                                            value={form.primeiroVencimento}
                                            onChange={(e) =>
                                                updateFormField(
                                                    "primeiroVencimento",
                                                    e.target.value
                                                )
                                            }
                                            error={!!formErrors.primeiroVencimento}
                                            helperText={formErrors.primeiroVencimento}
                                            fullWidth
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
                                                updateFormField(
                                                    "intervaloDias",
                                                    e.target.value
                                                )
                                            }
                                            error={!!formErrors.intervaloDias}
                                            helperText={formErrors.intervaloDias}
                                            fullWidth
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

            <Dialog
                open={openPrintPrompt}
                onClose={() => {
                    setOpenPrintPrompt(false);
                    setSaleToPrint(null);
                }}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <ReceiptLongIcon color="primary" />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                Venda concluída
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Deseja imprimir ou salvar o comprovante desta venda?
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: "grey.50",
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">
                                Venda
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                #{saleToPrint?.id || "-"}
                            </Typography>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="body2">
                                <strong>Cliente:</strong> {saleToPrint?.nomeCliente || "-"}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Total:</strong> {money(saleToPrint?.valorTotal)}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Itens:</strong> {(saleToPrint?.itens || []).length}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Data:</strong> {dateTimeBR(saleToPrint?.dataDaVenda)}
                            </Typography>
                        </Stack>
                    </Paper>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => {
                            setOpenPrintPrompt(false);
                            setSaleToPrint(null);
                        }}
                    >
                        Agora não
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        onClick={() => {
                            if (saleToPrint) {
                                handlePrintVenda(saleToPrint);
                            }
                            setOpenPrintPrompt(false);
                            setSaleToPrint(null);
                        }}
                    >
                        Imprimir / Salvar PDF
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDetails} onClose={closeView} maxWidth="md" fullWidth>
                <DialogTitle>Detalhes da venda</DialogTitle>
                <DialogContent dividers>
                    {detailsError && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDetailsError("")}>
                            {detailsError}
                        </Alert>
                    )}

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
                                        {getCategoriaFinanceiraNome(details.categoriaFinanceiraId)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Forma de pagamento
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        {getFormaPagamentoNome(details.formaPagamentoId)}
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
                    {details && (
                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => handlePrintVenda(details)}
                        >
                            Imprimir
                        </Button>
                    )}
                    <Button onClick={closeView}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </AppLayout>
    );
}