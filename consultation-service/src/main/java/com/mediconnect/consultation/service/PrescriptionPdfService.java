package com.mediconnect.consultation.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.mediconnect.consultation.dto.DoctorDetailsDto;
import com.mediconnect.consultation.dto.PatientDetailsDto;
import com.mediconnect.consultation.entity.Prescription;
import com.mediconnect.consultation.entity.PrescriptionItem;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Generates a standard Romanian "REŢETĂ MEDICALĂ" prescription PDF
 * following the legal paper-form layout (see model_reteta.png).
 */
@Service
public class PrescriptionPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    /** Generic tag marking a chunk whose value should be underlined with a dotted line. */
    private static final String DOTTED_UNDERLINE = "dotted-underline";

    private final BaseFont baseFont;

    public PrescriptionPdfService() {
        try {
            // Cp1250 (Central European) supports Romanian diacritics with the standard Helvetica font.
            this.baseFont = BaseFont.createFont(BaseFont.HELVETICA, "Cp1250", BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialise PDF font", e);
        }
    }

    public byte[] generate(Prescription prescription,
                           List<PrescriptionItem> items,
                           PatientDetailsDto patient,
                           DoctorDetailsDto doctor,
                           String diagnosisText) {
        // Half-A4 (prescription slip) keeps the proportions of the legal form.
        Document document = new Document(new Rectangle(420, 600), 36, 36, 28, 28);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new DottedUnderlineEvent());
            document.open();

            Font small = font(8);
            Font normal = font(10);
            Font bold = font(10, Font.BOLD);
            // Values are drawn with a dotted underline (see DottedUnderlineEvent), so the
            // fonts themselves no longer carry the solid Font.UNDERLINE style.
            Font value = font(10);
            Font boldUnderline = font(10, Font.BOLD);
            Font titleFont = font(16, Font.BOLD);

            // ── Header: medical unit ───────────────────────────────────────────
            if (doctor != null && doctor.clinicName() != null && !doctor.clinicName().isBlank()) {
                document.add(labelLine("Unitatea sanitară: ", sanitize(doctor.clinicName()), normal, boldUnderline));
            }

            // ── Title ──────────────────────────────────────────────────────────
            Paragraph title = new Paragraph("REŢETĂ MEDICALĂ", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(6);
            title.setSpacingAfter(10);
            document.add(title);

            // ── CNP boxes ──────────────────────────────────────────────────────
            document.add(cnpRow(patient != null ? patient.cnp() : null, bold));

            // ── Patient identity (only fields we actually store) ───────────────
            String lastName = patient != null ? sanitize(nullToBlank(patient.lastName())) : "";
            String firstName = patient != null ? sanitize(nullToBlank(patient.firstName())) : "";
            document.add(spacer(4));
            document.add(labelLine("Numele: ", lastName, normal, value));
            document.add(labelLine("Prenumele: ", firstName, normal, value));

            String sex = genderShort(patient);
            if (!sex.isBlank()) {
                document.add(labelLine("Sex: ", sex, normal, value));
            }

            if (patient != null && patient.dateOfBirth() != null) {
                String age = ageString(patient, prescription.getIssuedAt() != null
                        ? prescription.getIssuedAt().toLocalDate() : LocalDate.now());
                document.add(labelLine("Vârsta: ", age, normal, value));
            }

            String address = patient != null ? sanitize(nullToBlank(patient.address())) : "";
            if (!address.isBlank()) {
                document.add(labelLine("Domiciliu: ", address, normal, value));
            }

            // ── Diagnostic ─────────────────────────────────────────────────────
            String diagnostic = sanitize(nullToBlank(diagnosisText));
            if (!diagnostic.isBlank()) {
                document.add(spacer(4));
                document.add(labelLine("Diagnostic: ", diagnostic, normal, value));
            }

            // ── Rp. (medications) ──────────────────────────────────────────────
            document.add(spacer(6));
            Paragraph rp = new Paragraph("Rp.", bold);
            document.add(rp);

            if (items != null && !items.isEmpty()) {
                int idx = 1;
                for (PrescriptionItem item : items) {
                    StringBuilder line = new StringBuilder();
                    line.append(idx++).append(". ").append(sanitize(nullToBlank(item.getMedicationName())));
                    StringBuilder detail = new StringBuilder();
                    appendDetail(detail, item.getDosage());
                    appendDetail(detail, item.getFrequency());
                    if (item.getDurationDays() != null) appendDetail(detail, item.getDurationDays() + " zile");
                    if (item.getQuantity() != null) appendDetail(detail, "cant. " + item.getQuantity());
                    Paragraph medLine = new Paragraph(line.toString(), normal);
                    medLine.setIndentationLeft(12);
                    medLine.setSpacingBefore(3);
                    document.add(medLine);
                    if (detail.length() > 0) {
                        Paragraph detailLine = new Paragraph(sanitize(detail.toString()), small);
                        detailLine.setIndentationLeft(24);
                        document.add(detailLine);
                    }
                }
            }

            if (prescription.getCustomInstructions() != null && !prescription.getCustomInstructions().isBlank()) {
                Paragraph instr = new Paragraph(sanitize(prescription.getCustomInstructions()), small);
                instr.setIndentationLeft(12);
                instr.setSpacingBefore(6);
                document.add(instr);
            }

            // ── Validity ───────────────────────────────────────────────────────
            if (prescription.getValidUntil() != null) {
                Paragraph valid = new Paragraph("Valabilă: "
                        + (prescription.getValidFrom() != null ? prescription.getValidFrom().format(DATE_FMT) : "—")
                        + " – " + prescription.getValidUntil().format(DATE_FMT), small);
                valid.setSpacingBefore(8);
                document.add(valid);
            }

            // ── Footer: date + doctor signature ────────────────────────────────
            PdfPTable footer = new PdfPTable(2);
            footer.setWidthPercentage(100);
            footer.setSpacingBefore(24);
            String issueDate = prescription.getIssuedAt() != null
                    ? prescription.getIssuedAt().toLocalDate().format(DATE_FMT) : LocalDate.now().format(DATE_FMT);
            Phrase dateP = new Phrase();
            dateP.add(new Chunk("Data: ", normal));
            Chunk issueChunk = new Chunk(issueDate, value);
            issueChunk.setGenericTag(DOTTED_UNDERLINE);
            dateP.add(issueChunk);
            footer.addCell(noBorder(dateP, Element.ALIGN_LEFT));
            String docName = doctor != null
                    ? sanitize("Dr. " + nullToBlank(doctor.firstName()) + " " + nullToBlank(doctor.lastName())).trim()
                    : "";
            Phrase sig = new Phrase();
            sig.add(new Chunk(docName + "\n", normal));
            sig.add(new Chunk("Semnătura şi parafa medicului", small));
            footer.addCell(noBorder(sig, Element.ALIGN_RIGHT));
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate prescription PDF: " + e.getMessage(), e);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Font font(float size) { return new Font(baseFont, size); }

    private Font font(float size, int style) { return new Font(baseFont, size, style); }

    private Paragraph spacer(float height) {
        Paragraph p = new Paragraph(" ", font(height));
        p.setLeading(height);
        return p;
    }

    private Paragraph labelLine(String label, String value, Font labelFont, Font valueFont) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label, labelFont));
        // Pad empty values so the dotted fill-in line is still drawn on the form.
        String text = (value == null || value.isBlank()) ? "          " : value;
        Chunk valueChunk = new Chunk(text, valueFont);
        valueChunk.setGenericTag(DOTTED_UNDERLINE);
        p.add(valueChunk);
        p.setSpacingBefore(2);
        return p;
    }

    private PdfPTable cnpRow(String cnp, Font labelFont) {
        // Single 14-column table (label + 13 digit boxes) so it always fits on one row.
        PdfPTable table = new PdfPTable(14);
        table.setWidthPercentage(100);
        float[] widths = new float[14];
        widths[0] = 1.9f; // label column — kept tight so the boxes sit next to "C.N.P."
        for (int i = 1; i < 14; i++) widths[i] = 1f;
        try { table.setWidths(widths); } catch (DocumentException ignored) {}

        PdfPCell label = new PdfPCell(new Phrase("C.N.P.", labelFont));
        label.setBorder(Rectangle.NO_BORDER);
        label.setHorizontalAlignment(Element.ALIGN_LEFT);
        label.setVerticalAlignment(Element.ALIGN_MIDDLE);
        label.setPaddingLeft(0);
        label.setPaddingRight(0);
        table.addCell(label);

        Font boxFont = font(9);
        String digits = cnp != null ? cnp.replaceAll("\\D", "") : "";
        for (int i = 0; i < 13; i++) {
            String ch = i < digits.length() ? String.valueOf(digits.charAt(i)) : " ";
            PdfPCell cell = new PdfPCell(new Phrase(ch, boxFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setFixedHeight(14);
            cell.setBorderColor(Color.BLACK);
            table.addCell(cell);
        }
        return table;
    }

    private PdfPCell noBorder(Phrase phrase, int align) {
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(align);
        return cell;
    }

    private void appendDetail(StringBuilder sb, String value) {
        if (value == null || value.isBlank()) return;
        if (sb.length() > 0) sb.append(" · ");
        sb.append(value);
    }

    private String genderShort(PatientDetailsDto patient) {
        if (patient == null || patient.gender() == null || patient.gender().isBlank()) return "";
        String g = patient.gender().trim().toUpperCase();
        if (g.startsWith("M")) return "M";
        if (g.startsWith("F")) return "F";
        return patient.gender();
    }

    private String ageString(PatientDetailsDto patient, LocalDate reference) {
        if (patient == null || patient.dateOfBirth() == null) return "____";
        return Period.between(patient.dateOfBirth(), reference).getYears() + " ani";
    }

    private String nullToBlank(String s) { return s == null ? "" : s; }

    /**
     * Draws a dotted underline beneath every chunk tagged with {@link #DOTTED_UNDERLINE},
     * replacing the standard solid {@code Font.UNDERLINE} line.
     */
    private static final class DottedUnderlineEvent extends PdfPageEventHelper {
        @Override
        public void onGenericTag(PdfWriter writer, Document document, Rectangle rect, String text) {
            if (!DOTTED_UNDERLINE.equals(text)) return;
            PdfContentByte cb = writer.getDirectContent();
            cb.saveState();
            cb.setLineWidth(0.8f);
            cb.setLineCap(PdfContentByte.LINE_CAP_ROUND);
            // A zero-length "on" segment with a round cap renders as a round dot.
            cb.setLineDash(new float[]{0f, 2.5f}, 0f);
            float y = rect.getBottom() - 1f;
            cb.moveTo(rect.getLeft(), y);
            cb.lineTo(rect.getRight(), y);
            cb.stroke();
            cb.restoreState();
        }
    }

    /**
     * Maps Romanian comma-below characters (ș/ț) to the cedilla forms present in
     * Cp1250 so they do not render as missing glyphs with the standard font.
     */
    private String sanitize(String s) {
        if (s == null) return "";
        return s
            .replace('ș', 'ş')  // ș -> ş
            .replace('ț', 'ţ')  // ț -> ţ
            .replace('Ș', 'Ş')  // Ș -> Ş
            .replace('Ț', 'Ţ'); // Ț -> Ţ
    }
}
