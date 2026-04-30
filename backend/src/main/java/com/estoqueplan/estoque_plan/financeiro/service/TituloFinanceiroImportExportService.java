package com.estoqueplan.estoque_plan.financeiro.service;

import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.financeiro.dto.TituloFinanceiroCreateDTO;
import com.estoqueplan.estoque_plan.financeiro.model.CategoriaFinanceira;
import com.estoqueplan.estoque_plan.financeiro.model.FormaPagamento;
import com.estoqueplan.estoque_plan.financeiro.model.TituloFinanceiro;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoPagamento;
import com.estoqueplan.estoque_plan.financeiro.model.enums.TipoTitulo;
import com.estoqueplan.estoque_plan.financeiro.repository.CategoriaFinanceiraRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.FormaPagamentoRepository;
import com.estoqueplan.estoque_plan.financeiro.repository.TituloFinanceiroRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TituloFinanceiroImportExportService {

    private final TituloFinanceiroRepository tituloRepository;
    private final CategoriaFinanceiraRepository categoriaRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    private final TituloFinanceiroService tituloFinanceiroService;

    public TituloFinanceiroImportExportService(
            TituloFinanceiroRepository tituloRepository,
            CategoriaFinanceiraRepository categoriaRepository,
            FormaPagamentoRepository formaPagamentoRepository,
            TituloFinanceiroService tituloFinanceiroService
    ) {
        this.tituloRepository = tituloRepository;
        this.categoriaRepository = categoriaRepository;
        this.formaPagamentoRepository = formaPagamentoRepository;
        this.tituloFinanceiroService = tituloFinanceiroService;
    }

    public byte[] exportarXlsx() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Títulos");

            String[] colunas = {
                    "ID", "Tipo", "Descrição", "Valor Total", "Categoria",
                    "Status", "Data Emissão", "Parcelas", "Venda ID"
            };

            Row header = sheet.createRow(0);
            for (int i = 0; i < colunas.length; i++) {
                header.createCell(i).setCellValue(colunas[i]);
            }

            List<TituloFinanceiro> titulos = tituloRepository.findAll();

            int rowIdx = 1;
            for (TituloFinanceiro t : titulos) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(t.getId() != null ? t.getId() : 0);
                row.createCell(1).setCellValue(t.getTipo() != null ? t.getTipo().name() : "");
                row.createCell(2).setCellValue(valorTexto(t.getDescricao()));
                row.createCell(3).setCellValue(t.getValorTotal() != null ? t.getValorTotal().doubleValue() : 0);
                row.createCell(4).setCellValue(t.getCategoria() != null ? t.getCategoria().getNome() : "");
                row.createCell(5).setCellValue(t.getStatus() != null ? t.getStatus().name() : "");
                row.createCell(6).setCellValue(t.getDataEmissao() != null ? t.getDataEmissao().toString() : "");
                row.createCell(7).setCellValue(t.getParcelas() != null ? t.getParcelas().size() : 0);
                row.createCell(8).setCellValue(t.getVenda() != null ? t.getVenda().getId() : 0);
            }

            for (int i = 0; i < colunas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao exportar títulos em XLSX.");
        }
    }

    public byte[] exportarPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);

            document.open();

            Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font textoFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            Paragraph titulo = new Paragraph("Relatório de Títulos Financeiros", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(16);
            document.add(titulo);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 2f, 4f, 2f, 3f, 2f, 2f});

            adicionarHeader(table, "ID");
            adicionarHeader(table, "Tipo");
            adicionarHeader(table, "Descrição");
            adicionarHeader(table, "Valor");
            adicionarHeader(table, "Categoria");
            adicionarHeader(table, "Status");
            adicionarHeader(table, "Parcelas");

            for (TituloFinanceiro t : tituloRepository.findAll()) {
                table.addCell(new Phrase(String.valueOf(t.getId()), textoFont));
                table.addCell(new Phrase(t.getTipo() != null ? t.getTipo().name() : "-", textoFont));
                table.addCell(new Phrase(valorTexto(t.getDescricao()), textoFont));
                table.addCell(new Phrase(formatarDecimal(t.getValorTotal()), textoFont));
                table.addCell(new Phrase(t.getCategoria() != null ? t.getCategoria().getNome() : "-", textoFont));
                table.addCell(new Phrase(t.getStatus() != null ? t.getStatus().name() : "-", textoFont));
                table.addCell(new Phrase(String.valueOf(t.getParcelas() != null ? t.getParcelas().size() : 0), textoFont));
            }

            document.add(table);
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao exportar títulos em PDF.");
        }
    }

    public int importarXlsx(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RegraNegocioException("Arquivo XLSX não informado.");
        }

        int importados = 0;

        try (Workbook workbook = new XSSFWorkbook(arquivo.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            if (sheet == null || sheet.getPhysicalNumberOfRows() <= 1) {
                throw new RegraNegocioException("Planilha vazia ou sem títulos.");
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);

                if (row == null || linhaVazia(row)) {
                    continue;
                }

                int linhaExcel = i + 1;

                String tipoTexto = lerTexto(row, 0);
                String descricao = lerTexto(row, 1);
                BigDecimal valorTotal = lerBigDecimal(row, 2);
                String categoriaNome = lerTexto(row, 3);
                String formaTexto = lerTexto(row, 4);
                Integer numeroParcelas = lerInteiro(row, 5);
                LocalDate primeiroVencimento = lerData(row, 6);
                Integer intervaloDias = lerInteiro(row, 7);

                if (tipoTexto.isBlank()) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": tipo é obrigatório.");
                }

                TipoTitulo tipo;
                try {
                    tipo = TipoTitulo.valueOf(tipoTexto.trim().toUpperCase());
                } catch (Exception e) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": tipo deve ser A_RECEBER ou A_PAGAR.");
                }

                if (descricao.isBlank()) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": descrição é obrigatória.");
                }

                if (valorTotal == null || valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": valor total deve ser maior que zero.");
                }

                if (categoriaNome.isBlank()) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": categoria financeira é obrigatória.");
                }

                if (formaTexto.isBlank()) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": forma de pagamento é obrigatória.");
                }

                TipoPagamento tipoPagamento;
                try {
                    tipoPagamento = TipoPagamento.valueOf(formaTexto.trim().toUpperCase());
                } catch (Exception e) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": forma de pagamento inválida.");
                }

                if (numeroParcelas == null || numeroParcelas <= 0) {
                    numeroParcelas = 1;
                }

                if (primeiroVencimento == null) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": primeiro vencimento é obrigatório.");
                }

                if (intervaloDias == null || intervaloDias <= 0) {
                    intervaloDias = 30;
                }

                CategoriaFinanceira categoria = categoriaRepository
                        .findByNomeIgnoreCaseAndAtivoTrue(categoriaNome)
                        .orElseThrow(() -> new RegraNegocioException(
                                "Linha " + linhaExcel + ": categoria financeira \"" + categoriaNome + "\" não encontrada ou inativa."
                        ));

                if (categoria.getTipo() != tipo) {
                    throw new RegraNegocioException(
                            "Linha " + linhaExcel + ": categoria \"" + categoriaNome + "\" não pertence ao tipo " + tipo + "."
                    );
                }

                FormaPagamento formaPagamento = formaPagamentoRepository
                        .findByTipoAndAtivoTrue(tipoPagamento)
                        .orElseThrow(() -> new RegraNegocioException(
                                "Linha " + linhaExcel + ": forma de pagamento \"" + formaTexto + "\" não encontrada ou inativa."
                        ));

                TituloFinanceiroCreateDTO dto = new TituloFinanceiroCreateDTO();
                dto.setTipo(tipo);
                dto.setDescricao(descricao);
                dto.setValorTotal(valorTotal);
                dto.setCategoriaId(categoria.getId());
                dto.setFormaPagamentoId(formaPagamento.getId());
                dto.setNumeroParcelas(numeroParcelas);
                dto.setPrimeiroVencimento(primeiroVencimento);
                dto.setIntervaloDias(intervaloDias);

                tituloFinanceiroService.criarTitulo(dto);
                importados++;
            }

            return importados;
        } catch (RegraNegocioException e) {
            throw e;
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao importar XLSX. Verifique o formato da planilha.");
        }
    }

    private void adicionarHeader(PdfPTable table, String texto) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
        table.addCell(new Phrase(texto, font));
    }

    private String valorTexto(String valor) {
        return valor == null ? "" : valor;
    }

    private String formatarDecimal(BigDecimal valor) {
        return valor == null ? "0,00" : valor.toString().replace(".", ",");
    }

    private boolean linhaVazia(Row row) {
        for (int i = 0; i <= 7; i++) {
            if (!lerTexto(row, i).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String lerTexto(Row row, int index) {
        Cell cell = row.getCell(index);

        if (cell == null) {
            return "";
        }

        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }

    private BigDecimal lerBigDecimal(Row row, int index) {
        String valor = lerTexto(row, index);

        if (valor.isBlank()) {
            return null;
        }

        valor = valor.replace("R$", "")
                .replace(".", "")
                .replace(",", ".")
                .trim();

        return new BigDecimal(valor);
    }

    private Integer lerInteiro(Row row, int index) {
        String valor = lerTexto(row, index);

        if (valor.isBlank()) {
            return null;
        }

        valor = valor.replace(".", "")
                .replace(",", ".")
                .trim();

        return new BigDecimal(valor).intValue();
    }

    private LocalDate lerData(Row row, int index) {
        Cell cell = row.getCell(index);

        if (cell == null) {
            return null;
        }

        if (DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }

        String valor = lerTexto(row, index);
        if (valor.isBlank()) {
            return null;
        }

        return LocalDate.parse(valor);
    }
}