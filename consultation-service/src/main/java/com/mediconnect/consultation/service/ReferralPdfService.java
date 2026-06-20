package com.mediconnect.consultation.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfGState;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.mediconnect.consultation.dto.DoctorDetailsDto;
import com.mediconnect.consultation.dto.PatientDetailsDto;
import com.mediconnect.consultation.entity.Referral;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Generates a Romanian "BILET DE TRIMITERE" referral PDF following the legal
 * paper-form layout. Mirrors the structure of {@link PrescriptionPdfService}.
 */
@Service
public class ReferralPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final String DOTTED_UNDERLINE = "dotted-underline";

    private final BaseFont baseFont;

    public ReferralPdfService() {
        try {
            this.baseFont = BaseFont.createFont(BaseFont.HELVETICA, "Cp1250", BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialise PDF font", e);
        }
    }

    public byte[] generate(Referral referral,
                           PatientDetailsDto patient,
                           DoctorDetailsDto doctor,
                           String diagnosisText) {
        Document document = new Document(PageSize.A4, 42, 42, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReferralPageEvent(baseFont));
            document.open();

            Font small = font(8);
            Font normal = font(10);
            Font bold = font(10, Font.BOLD);
            Font value = font(10);
            Font sectionFont = font(10, Font.BOLD);
            Font titleFont = font(15, Font.BOLD);

            boolean isInvestigation = isInvestigationType(referral.getReferralType());

            // ── Title ──────────────────────────────────────────────────────────
            Paragraph title = new Paragraph("BILET DE TRIMITERE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(2);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                isInvestigation ? "pentru investigaţii paraclinice decontate de CAS" : "către alte specialităţi / internare", small);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(10);
            document.add(subtitle);

            // ── Series / number + date + priority ──────────────────────────────
            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);
            String series = nullToBlank(referral.getSeriesNumber());
            meta.addCell(noBorder(labelPhrase("Seria şi nr.: ", series.isBlank() ? "          " : sanitize(series), normal, value), Element.ALIGN_LEFT));
            String issueDate = referral.getIssuedAt() != null
                ? referral.getIssuedAt().toLocalDate().format(DATE_FMT) : LocalDate.now().format(DATE_FMT);
            meta.addCell(noBorder(labelPhrase("Data emiterii: ", issueDate, normal, value), Element.ALIGN_RIGHT));
            document.add(meta);
            document.add(labelLine("Nivel prioritate: ", priorityLabel(referral.getUrgency()), normal, value));

            // ── Câmp 1 — Unitate medicală (emitent) ────────────────────────────
            document.add(section("1. Unitatea medicală (emitent)", sectionFont));
            if (doctor != null) {
                document.add(labelLine("Denumire: ", sanitize(nullToBlank(doctor.clinicName())), normal, value));
                document.add(labelLine("CUI: ", sanitize(nullToBlank(doctor.cui())), normal, value));
                document.add(labelLine("Adresă: ", sanitize(nullToBlank(doctor.clinicAddress())), normal, value));
                document.add(labelLine("CAS contract: ", sanitize(nullToBlank(doctor.cas())), normal, value));
                document.add(labelLine("Nr. contract CNAS: ", sanitize(nullToBlank(doctor.cnasContractNumber())), normal, value));
                document.add(providerTypeLine(doctor.providerType(), normal, bold));
            } else {
                document.add(labelLine("Denumire: ", "", normal, value));
            }

            // ── Câmp 2 — Date de identificare asigurat ─────────────────────────
            document.add(section("2. Date de identificare asigurat", sectionFont));
            String lastName = patient != null ? sanitize(nullToBlank(patient.lastName())) : "";
            String firstName = patient != null ? sanitize(nullToBlank(patient.firstName())) : "";
            document.add(labelLine("Nume şi prenume: ", (lastName + " " + firstName).trim(), normal, value));
            document.add(cnpRow(patient != null ? patient.cnp() : null, bold));
            document.add(spacer(2));
            document.add(labelLine("Domiciliu: ", patient != null ? sanitize(nullToBlank(patient.address())) : "", normal, value));
            document.add(labelLine("Categorie asigurat: ", sanitize(nullToBlank(referral.getInsuredCategory())), normal, value));

            // ── Câmp 3 — Diagnostic ────────────────────────────────────────────
            document.add(section("3. Diagnostic (cod ICD-10)", sectionFont));
            document.add(labelLine("Diagnostic: ", sanitize(nullToBlank(diagnosisText)), normal, value));
            document.add(acuteChronicLine(referral.getAcuteChronic(), normal, bold));

            // ── Câmp 4 — conditional content ───────────────────────────────────
            if (isInvestigation) {
                document.add(section("4. Investigaţii paraclinice recomandate", sectionFont));
                String inv = sanitize(nullToBlank(referral.getInvestigations()));
                Paragraph invP = new Paragraph(inv.isBlank() ? "—" : inv, normal);
                invP.setSpacingBefore(2);
                document.add(invP);
            } else {
                document.add(section("4. Trimitere către specialitate / internare", sectionFont));
                document.add(labelLine("Specialitatea / destinaţia: ", sanitize(nullToBlank(referral.getDestination())), normal, value));
                String reason = sanitize(nullToBlank(referral.getReason()));
                document.add(labelLine("Motivul trimiterii: ", reason, normal, value));
            }

            // ── Câmp 7 — Termen de valabilitate ────────────────────────────────
            Integer days = referral.getValidityDays();
            String validityText = days != null
                ? "Asiguratul are obligaţia de a se programa în termen de " + days + " de zile de la data emiterii, "
                  + "după care biletul îşi pierde valabilitatea."
                : "";
            if (!validityText.isBlank()) {
                Paragraph validity = new Paragraph(sanitize(validityText), small);
                validity.setSpacingBefore(10);
                document.add(validity);
            }

            // ── Câmp 5 — Medic prescriptor ─────────────────────────────────────
            PdfPTable footer = new PdfPTable(2);
            footer.setWidthPercentage(100);
            footer.setSpacingBefore(28);
            String docName = doctor != null
                ? sanitize("Dr. " + nullToBlank(doctor.firstName()) + " " + nullToBlank(doctor.lastName())).trim() : "";
            String parafa = doctor != null ? sanitize(nullToBlank(doctor.licenseNumber())) : "";
            Phrase sig = new Phrase();
            sig.add(new Chunk(docName + "\n", normal));
            sig.add(new Chunk(parafa.isBlank() ? "Parafă: ____________\n" : "Parafă: " + parafa + "\n", small));
            sig.add(new Chunk("Semnătura şi ştampila cabinetului", small));
            footer.addCell(noBorder(sig, Element.ALIGN_LEFT));

            // ── Câmp 6 — Data prezentării + semnătura asiguratului ─────────────
            Phrase patientPart = new Phrase();
            patientPart.add(new Chunk("Data prezentării asiguratului: ____________\n", small));
            patientPart.add(new Chunk("Semnătura asiguratului: ____________", small));
            footer.addCell(noBorder(patientPart, Element.ALIGN_RIGHT));
            document.add(footer);

            Paragraph note = new Paragraph(sanitize(
                "(Data prezentării şi semnătura asiguratului se completează la momentul prezentării la furnizor.)"), font(7));
            note.setSpacingBefore(8);
            document.add(note);

            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate referral PDF: " + e.getMessage(), e);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private boolean isInvestigationType(String type) {
        return "LABORATORY".equals(type) || "IMAGING".equals(type);
    }

    private String priorityLabel(String urgency) {
        if (urgency == null) return "Obişnuit";
        return switch (urgency) {
            case "URGENT", "EMERGENCY" -> "Urgent";
            default -> "Obişnuit";
        };
    }

    private Font font(float size) { return new Font(baseFont, size); }

    private Font font(float size, int style) { return new Font(baseFont, size, style); }

    private Paragraph spacer(float height) {
        Paragraph p = new Paragraph(" ", font(height));
        p.setLeading(height);
        return p;
    }

    private Paragraph section(String text, Font f) {
        Paragraph p = new Paragraph(sanitize(text), f);
        p.setSpacingBefore(10);
        p.setSpacingAfter(2);
        return p;
    }

    private Phrase labelPhrase(String label, String value, Font labelFont, Font valueFont) {
        Phrase p = new Phrase();
        p.add(new Chunk(label, labelFont));
        Chunk valueChunk = new Chunk(value, valueFont);
        valueChunk.setGenericTag(DOTTED_UNDERLINE);
        p.add(valueChunk);
        return p;
    }

    private Paragraph labelLine(String label, String value, Font labelFont, Font valueFont) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label, labelFont));
        String text = (value == null || value.isBlank()) ? "          " : value;
        Chunk valueChunk = new Chunk(text, valueFont);
        valueChunk.setGenericTag(DOTTED_UNDERLINE);
        p.add(valueChunk);
        p.setSpacingBefore(2);
        return p;
    }

    private Paragraph providerTypeLine(String providerType, Font normal, Font bold) {
        Paragraph p = new Paragraph();
        p.add(new Chunk("Tip furnizor: ", normal));
        p.add(checkbox("MF", "MF".equals(providerType), normal, bold));
        p.add(new Chunk("   ", normal));
        p.add(checkbox("Amb. Spec.", "AMB_SPEC".equals(providerType), normal, bold));
        p.add(new Chunk("   ", normal));
        p.add(checkbox("Altele", "OTHER".equals(providerType), normal, bold));
        p.setSpacingBefore(2);
        return p;
    }

    private Paragraph acuteChronicLine(String acuteChronic, Font normal, Font bold) {
        Paragraph p = new Paragraph();
        p.add(new Chunk("Tip diagnostic: ", normal));
        p.add(checkbox("A/S — acut/subacut (30 zile)", "ACUTE".equals(acuteChronic), normal, bold));
        p.add(new Chunk("   ", normal));
        p.add(checkbox("C — cronic (60 zile)", "CHRONIC".equals(acuteChronic), normal, bold));
        p.setSpacingBefore(2);
        return p;
    }

    private Chunk checkbox(String label, boolean checked, Font normal, Font bold) {
        return new Chunk((checked ? "[X] " : "[ ] ") + sanitize(label), checked ? bold : normal);
    }

    private PdfPTable cnpRow(String cnp, Font labelFont) {
        PdfPTable table = new PdfPTable(14);
        table.setWidthPercentage(100);
        float[] widths = new float[14];
        widths[0] = 1.9f;
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

    private String nullToBlank(String s) { return s == null ? "" : s; }

    private static final class ReferralPageEvent extends PdfPageEventHelper {
        private final BaseFont watermarkFont;

        ReferralPageEvent(BaseFont watermarkFont) {
            this.watermarkFont = watermarkFont;
        }

        /** Draws a faint, semi-transparent "CNAS" watermark in the top-left corner. */
        @Override
        public void onStartPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContentUnder();
            cb.saveState();
            PdfGState gs = new PdfGState();
            gs.setFillOpacity(0.12f);
            cb.setGState(gs);
            cb.beginText();
            cb.setColorFill(new Color(20, 60, 130));
            cb.setFontAndSize(watermarkFont, 34);
            cb.showTextAligned(Element.ALIGN_LEFT, "CNAS", document.left(), document.top() - 24, 0);
            cb.endText();
            cb.restoreState();
        }

        @Override
        public void onGenericTag(PdfWriter writer, Document document, Rectangle rect, String text) {
            if (!DOTTED_UNDERLINE.equals(text)) return;
            PdfContentByte cb = writer.getDirectContent();
            cb.saveState();
            cb.setLineWidth(0.8f);
            cb.setLineCap(PdfContentByte.LINE_CAP_ROUND);
            cb.setLineDash(new float[]{0f, 2.5f}, 0f);
            float y = rect.getBottom() - 1f;
            cb.moveTo(rect.getLeft(), y);
            cb.lineTo(rect.getRight(), y);
            cb.stroke();
            cb.restoreState();
        }
    }

    private String sanitize(String s) {
        if (s == null) return "";
        return s
            .replace('ș', 'ş')
            .replace('ț', 'ţ')
            .replace('Ș', 'Ş')
            .replace('Ț', 'Ţ');
    }
}
