package com.estoqueplan.estoque_plan.service;

import com.estoqueplan.estoque_plan.exception.RegraNegocioException;
import com.estoqueplan.estoque_plan.model.Venda;
import com.estoqueplan.estoque_plan.repository.VendaRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class VendaExportService {

    private final VendaRepository vendaRepository;

    public VendaExportService(VendaRepository vendaRepository) {
        this.vendaRepository = vendaRepository;
    }

    public byte[] exportarXlsx() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Vendas");

            String[] colunas = {
                    "ID",
                    "Data",
                    "Cliente",
                    "Telefone",
                    "Rua",
                    "Bairro",
                    "Desconto",
                    "Adicional",
                    "Frete",
                    "Total",
                    "Status",
                    "Cancelada em",
                    "Motivo cancelamento"
            };

            Row header = sheet.createRow(0);
            for (int i = 0; i < colunas.length; i++) {
                header.createCell(i).setCellValue(colunas[i]);
            }

            List<Venda> vendas = vendaRepository.findAll();

            int rowIdx = 1;
            for (Venda v : vendas) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(v.getId() != null ? v.getId() : 0);
                row.createCell(1).setCellValue(v.getDataDaVenda() != null ? v.getDataDaVenda().toString() : "");
                row.createCell(2).setCellValue(v.getCliente() != null ? texto(v.getCliente().getNome()) : "-");
                row.createCell(3).setCellValue(texto(v.getFone()));
                row.createCell(4).setCellValue(texto(v.getRua()));
                row.createCell(5).setCellValue(texto(v.getBairro()));
                row.createCell(6).setCellValue(decimal(v.getDesconto()).doubleValue());
                row.createCell(7).setCellValue(decimal(v.getAdicional()).doubleValue());
                row.createCell(8).setCellValue(decimal(v.getFrete()).doubleValue());
                row.createCell(9).setCellValue(decimal(v.getValorTotal()).doubleValue());
                row.createCell(10).setCellValue(v.getStatus() != null ? v.getStatus().name() : "");
                row.createCell(11).setCellValue(v.getCanceladaEm() != null ? v.getCanceladaEm().toString() : "");
                row.createCell(12).setCellValue(texto(v.getMotivoCancelamento()));
            }

            for (int i = 0; i < colunas.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao exportar vendas em XLSX.");
        }
    }

    public byte[] exportarPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);

            document.open();

            Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font textoFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            Paragraph titulo = new Paragraph("Relatório de Vendas", tituloFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(16);
            document.add(titulo);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 2.4f, 4f, 2f, 2f, 2f, 2f});

            header(table, "ID");
            header(table, "Data");
            header(table, "Cliente");
            header(table, "Telefone");
            header(table, "Total");
            header(table, "Status");
            header(table, "Itens");

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            for (Venda v : vendaRepository.findAll()) {
                table.addCell(new Phrase(String.valueOf(v.getId()), textoFont));
                table.addCell(new Phrase(v.getDataDaVenda() != null ? v.getDataDaVenda().format(fmt) : "-", textoFont));
                table.addCell(new Phrase(v.getCliente() != null ? texto(v.getCliente().getNome()) : "-", textoFont));
                table.addCell(new Phrase(texto(v.getFone()), textoFont));
                table.addCell(new Phrase(formatarDecimal(v.getValorTotal()), textoFont));
                table.addCell(new Phrase(v.getStatus() != null ? v.getStatus().name() : "-", textoFont));
                table.addCell(new Phrase(String.valueOf(v.getItens() != null ? v.getItens().size() : 0), textoFont));
            }

            document.add(table);
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RegraNegocioException("Erro ao exportar vendas em PDF.");
        }
    }

    private void header(PdfPTable table, String texto) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
        table.addCell(new Phrase(texto, font));
    }

    private String texto(String valor) {
        return valor == null ? "" : valor;
    }

    private BigDecimal decimal(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }

    private String formatarDecimal(BigDecimal valor) {
        return decimal(valor).toString().replace(".", ",");
    }
}