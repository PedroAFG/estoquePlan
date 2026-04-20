export function money(v) {
    return Number(v || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function dateTimeBR(iso) {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleString("pt-BR");
    } catch {
        return "-";
    }
}

export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function buildVendaParaImpressao(vendaBase, contexto = {}) {
    const {
        getClienteById,
        getProdutoById,
        getCategoriaFinanceiraNome,
        getFormaPagamentoNome,
        getCategoriaProdutoNome,
    } = contexto;

    const cliente = getClienteById ? getClienteById(vendaBase?.clienteId) : null;

    const itens = (vendaBase?.itens || []).map((it) => {
        const produto = getProdutoById ? getProdutoById(it.produtoId) : null;

        return {
            ...it,
            descricaoProduto:
                it.descricaoProduto ||
                produto?.descricao ||
                `Produto #${it.produtoId || "-"}`,
            categoria:
                it.categoria ||
                produto?.categoria?.nome ||
                (getCategoriaProdutoNome
                    ? getCategoriaProdutoNome(produto?.categoria?.id)
                    : "-") ||
                "-",
            total:
                it.total ??
                Number(it.quantidade || 0) * Number(it.precoUnitario || 0),
        };
    });

    return {
        ...vendaBase,
        nomeCliente: vendaBase?.nomeCliente || cliente?.nome || "-",
        fone: vendaBase?.fone || cliente?.telefone || "-",
        rua: vendaBase?.rua || cliente?.endereco || "-",
        bairro: vendaBase?.bairro || "-",
        categoriaFinanceiraNome:
            vendaBase?.categoriaFinanceiraNome ||
            (getCategoriaFinanceiraNome
                ? getCategoriaFinanceiraNome(vendaBase?.categoriaFinanceiraId)
                : "-"),
        formaPagamentoNome:
            vendaBase?.formaPagamentoNome ||
            (getFormaPagamentoNome
                ? getFormaPagamentoNome(vendaBase?.formaPagamentoId)
                : "-"),
        itens,
    };
}

export function gerarHtmlComprovanteVenda(venda) {
    const itensHtml = (venda.itens || [])
        .map(
            (it, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(it.descricaoProduto || "-")}</td>
                    <td>${escapeHtml(it.categoria || "-")}</td>
                    <td>${escapeHtml(it.bitola || "-")}</td>
                    <td>${escapeHtml(it.comprimento || "-")}</td>
                    <td style="text-align:right;">${escapeHtml(it.quantidade || 0)}</td>
                    <td style="text-align:right;">${escapeHtml(it.unidade || "-")}</td>
                    <td style="text-align:right;">${escapeHtml(money(it.precoUnitario))}</td>
                    <td style="text-align:right; font-weight:700;">${escapeHtml(
                        money(it.total)
                    )}</td>
                </tr>
            `
        )
        .join("");

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8" />
            <title>Comprovante de Venda ${escapeHtml(venda.id || "-")}</title>
            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 24px;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #1f2937;
                    background: #fff;
                }

                .page {
                    max-width: 960px;
                    margin: 0 auto;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 24px;
                    border-bottom: 2px solid #111827;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }

                .brand h1 {
                    margin: 0;
                    font-size: 28px;
                    line-height: 1.1;
                }

                .brand p {
                    margin: 6px 0 0;
                    color: #6b7280;
                    font-size: 13px;
                }

                .sale-badge {
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 12px 16px;
                    min-width: 220px;
                }

                .sale-badge .label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .sale-badge .value {
                    font-size: 24px;
                    font-weight: 700;
                    margin-top: 4px;
                }

                .section {
                    margin-bottom: 22px;
                }

                .section-title {
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 10px;
                    color: #111827;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }

                .info-card {
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 12px 14px;
                    background: #fafafa;
                }

                .info-card .k {
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 4px;
                }

                .info-card .v {
                    font-size: 14px;
                    font-weight: 600;
                    word-break: break-word;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }

                thead th {
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    padding: 10px 8px;
                    font-size: 12px;
                    text-align: left;
                }

                tbody td {
                    border: 1px solid #e5e7eb;
                    padding: 10px 8px;
                    font-size: 13px;
                    vertical-align: top;
                }

                .totals {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 12px;
                    margin-top: 16px;
                }

                .total-box {
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 12px 14px;
                    background: #fafafa;
                }

                .total-box .k {
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 4px;
                }

                .total-box .v {
                    font-size: 18px;
                    font-weight: 700;
                }

                .total-box.highlight {
                    background: #111827;
                    color: white;
                    border-color: #111827;
                }

                .total-box.highlight .k {
                    color: #d1d5db;
                }

                .footer {
                    margin-top: 28px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                    color: #6b7280;
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .obs {
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 12px 14px;
                    background: #fafafa;
                    white-space: pre-wrap;
                    min-height: 70px;
                    font-size: 13px;
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    .page {
                        max-width: 100%;
                    }

                    .info-card,
                    .total-box,
                    .obs,
                    .sale-badge {
                        break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="header">
                    <div class="brand">
                        <h1>Comprovante de Venda</h1>
                        <p>Documento gerado pelo estoquePlan</p>
                    </div>

                    <div class="sale-badge">
                        <div class="label">Venda</div>
                        <div class="value">${escapeHtml(venda.id || "-")}</div>
                        <div style="margin-top:8px; font-size:12px; color:#6b7280;">
                            Data: ${escapeHtml(dateTimeBR(venda.dataDaVenda))}
                        </div>
                        <div style="margin-top:4px; font-size:12px; color:#6b7280;">
                            Status: ${escapeHtml(venda.status || "ATIVA")}
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Dados do cliente / entrega</div>
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="k">Cliente</div>
                            <div class="v">${escapeHtml(venda.nomeCliente || "-")}</div>
                        </div>
                        <div class="info-card">
                            <div class="k">Telefone</div>
                            <div class="v">${escapeHtml(venda.fone || "-")}</div>
                        </div>
                        <div class="info-card">
                            <div class="k">Rua / Endereço</div>
                            <div class="v">${escapeHtml(venda.rua || "-")}</div>
                        </div>
                        <div class="info-card">
                            <div class="k">Bairro</div>
                            <div class="v">${escapeHtml(venda.bairro || "-")}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Itens da venda</div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Bitola</th>
                                <th>Comprimento</th>
                                <th style="text-align:right;">Qtd</th>
                                <th style="text-align:right;">Un</th>
                                <th style="text-align:right;">Preço unit.</th>
                                <th style="text-align:right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                itensHtml ||
                                `
                                <tr>
                                    <td colspan="9" style="text-align:center; color:#6b7280;">
                                        Nenhum item encontrado
                                    </td>
                                </tr>
                            `
                            }
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Financeiro</div>
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="k">Forma de pagamento</div>
                            <div class="v">${escapeHtml(venda.formaPagamentoNome || "-")}</div>
                        </div>
                        <div class="info-card">
                            <div class="k">Número de parcelas</div>
                            <div class="v">${escapeHtml(venda.numeroParcelas || "-")}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Observação</div>
                    <div class="obs">${escapeHtml(venda.observacao || "-")}</div>
                </div>

                <div class="section">
                    <div class="section-title">Resumo financeiro</div>
                    <div class="totals">
                        <div class="total-box">
                            <div class="k">Desconto</div>
                            <div class="v">${escapeHtml(money(venda.desconto))}</div>
                        </div>
                        <div class="total-box">
                            <div class="k">Adicional</div>
                            <div class="v">${escapeHtml(money(venda.adicional))}</div>
                        </div>
                        <div class="total-box">
                            <div class="k">Frete</div>
                            <div class="v">${escapeHtml(money(venda.frete))}</div>
                        </div>
                        <div class="total-box highlight">
                            <div class="k">Total final</div>
                            <div class="v">${escapeHtml(money(venda.valorTotal))}</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div>Gerado em: ${escapeHtml(new Date().toLocaleString("pt-BR"))}</div>
                    <div>estoquePlan</div>
                </div>
            </div>

            <script>
                window.onload = function () {
                    window.focus();
                    window.print();
                };
            </script>
        </body>
        </html>
    `;
}

export function imprimirHtml(html, onBlocked) {
    const printWindow = window.open("", "_blank", "width=1100,height=800");

    if (!printWindow) {
        if (onBlocked) {
            onBlocked();
        }
        return false;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    return true;
}