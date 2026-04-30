package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.model.Categoria;
import com.estoqueplan.estoque_plan.model.Produto;
import com.estoqueplan.estoque_plan.repository.CategoriaRepository;
import com.estoqueplan.estoque_plan.repository.ProdutoRepository;
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
import java.util.List;

@Service
public class ProdutoImportExportService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoImportExportService(
            ProdutoRepository produtoRepository,
            CategoriaRepository categoriaRepository
    ) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public byte[] exportarXlsx(Boolean incluirInativos) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Produtos");

            Row header = sheet.createRow(0);
            String[] colunas = {
                    "ID",
                    "Descrição",
                    "Unidade",
                    "Categoria",
                    "Quantidade",
                    "Estoque mínimo",
                    "Custo",
                    "Preço varejo",
                    "NCM",
                    "ID Sebrae",
                    "Status"
            };

            for (int i = 0; i < colunas.length; i++) {
                header.createCell(i).setCellValue(colunas[i]);
            }

            List<Produto> produtos = Boolean.TRUE.equals(incluirInativos)
                    ? produtoRepository.findAll()
                    : produtoRepository.findByAtivoTrue();

            int rowIdx = 1;

            for (Produto p : produtos) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(p.getId() != null ? p.getId() : 0);
                row.createCell(1).setCellValue(valorTexto(p.getDescricao()));
                row.createCell(2).setCellValue(valorTexto(p.getUnidade()));
                row.createCell(3).setCellValue(
                        p.getCategoria() != null ? valorTexto(p.getCategoria().getNome()) : ""
                );
                row.createCell(4).setCellValue(p.getQuantidadeDisponivel() != null ? p.getQuantidadeDisponivel() : 0);
                row.createCell(5).setCellValue(p.getEstoqueMinimo() != null ? p.getEstoqueMinimo() : 0);
                row.createCell(6).setCellValue(p.getCusto() != null ? p.getCusto().doubleValue() : 0);
                row.createCell(7).setCellValue(p.getPrecoVarejo() != null ? p.getPrecoVarejo().doubleValue() : 0);
                row.createCell(8).setCellValue(valorTexto(p.getNcm()));
                row.createCell(9).setCellValue(valorTexto(p.getIdSebrae()));
                row.createCell(10).setCellValue(p.isAtivo() ? "ATIVO" : "INATIVO");
            }

            for (int i = 0; i < colunas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao exportar produtos em XLSX.");
        }
    }

    public byte[] exportarPdf(Boolean incluirInativos) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);

            document.open();

            Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font textoFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            Paragraph titulo = new Paragraph("Relatório de Produtos", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(16);
            document.add(titulo);

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 4f, 2f, 3f, 2f, 2f, 2f, 2f});

            adicionarCelula(table, "ID");
            adicionarCelula(table, "Descrição");
            adicionarCelula(table, "Un.");
            adicionarCelula(table, "Categoria");
            adicionarCelula(table, "Qtde");
            adicionarCelula(table, "Est. mín.");
            adicionarCelula(table, "Custo");
            adicionarCelula(table, "Preço");

            List<Produto> produtos = Boolean.TRUE.equals(incluirInativos)
                    ? produtoRepository.findAll()
                    : produtoRepository.findByAtivoTrue();

            for (Produto p : produtos) {
                table.addCell(new Phrase(String.valueOf(p.getId()), textoFont));
                table.addCell(new Phrase(valorTexto(p.getDescricao()), textoFont));
                table.addCell(new Phrase(valorTexto(p.getUnidade()), textoFont));
                table.addCell(new Phrase(p.getCategoria() != null ? valorTexto(p.getCategoria().getNome()) : "-", textoFont));
                table.addCell(new Phrase(String.valueOf(p.getQuantidadeDisponivel() != null ? p.getQuantidadeDisponivel() : 0), textoFont));
                table.addCell(new Phrase(String.valueOf(p.getEstoqueMinimo() != null ? p.getEstoqueMinimo() : 0), textoFont));
                table.addCell(new Phrase(formatarDecimal(p.getCusto()), textoFont));
                table.addCell(new Phrase(formatarDecimal(p.getPrecoVarejo()), textoFont));
            }

            document.add(table);
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao exportar produtos em PDF.");
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
                throw new RegraNegocioException("Planilha vazia ou sem produtos.");
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);

                if (row == null || linhaVazia(row)) {
                    continue;
                }

                int linhaExcel = i + 1;

                String descricao = lerTexto(row, 0);
                String unidade = lerTexto(row, 1);
                String categoriaNome = lerTexto(row, 2);
                BigDecimal custo = lerBigDecimal(row, 3);
                BigDecimal precoVarejo = lerBigDecimal(row, 4);
                Integer quantidade = lerInteiro(row, 5);
                Integer estoqueMinimo = lerInteiro(row, 6);
                String ncm = lerTexto(row, 7);
                String idSebrae = lerTexto(row, 8);

                if (descricao.isBlank()) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": descrição é obrigatória.");
                }

                if (unidade.isBlank()) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": unidade é obrigatória.");
                }

                if (categoriaNome.isBlank()) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": categoria é obrigatória.");
                }

                if (custo == null || custo.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": custo inválido.");
                }

                if (precoVarejo == null || precoVarejo.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": preço varejo inválido.");
                }

                if (quantidade == null || quantidade < 0) {
                    throw new RegraNegocioException("Linha " + linhaExcel + ": quantidade inválida.");
                }

                if (estoqueMinimo == null || estoqueMinimo < 0) {
                    estoqueMinimo = 0;
                }

                Categoria categoria = categoriaRepository.findByNomeIgnoreCase(categoriaNome)
                        .orElseThrow(() -> new RegraNegocioException(
                                "Linha " + linhaExcel + ": categoria \"" + categoriaNome + "\" não encontrada."
                        ));

                if (!categoria.isAtivo()) {
                    throw new RegraNegocioException(
                            "Linha " + linhaExcel + ": categoria \"" + categoriaNome + "\" está inativa."
                    );
                }

                Produto produto = new Produto();
                produto.setDescricao(descricao);
                produto.setUnidade(unidade);
                produto.setCategoria(categoria);
                produto.setCusto(custo);
                produto.setPrecoVarejo(precoVarejo);
                produto.setQuantidadeDisponivel(quantidade);
                produto.setEstoqueMinimo(estoqueMinimo);
                produto.setNcm(ncm);
                produto.setIdSebrae(idSebrae);
                produto.setAtivo(true);

                produtoRepository.save(produto);
                importados++;
            }

            return importados;
        } catch (RegraNegocioException e) {
            throw e;
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao importar XLSX. Verifique o formato da planilha.");
        }
    }

    private void adicionarCelula(PdfPTable table, String texto) {
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
        for (int i = 0; i <= 8; i++) {
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
}