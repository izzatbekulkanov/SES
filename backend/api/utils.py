import os
import qrcode
from datetime import datetime
from io import BytesIO
from django.core.files.base import ContentFile
from django.conf import settings
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas as pdfcanvas


# ─── Savdo Akademiyasi brand colors ───────────────────────────────────────────
BRAND_NAVY   = colors.HexColor('#0a1628')   # Dark navy background
BRAND_GOLD   = colors.HexColor('#c9a84c')   # Gold accent
BRAND_GOLD2  = colors.HexColor('#e8c97a')   # Light gold
BRAND_BLUE   = colors.HexColor('#1a3a6e')   # Mid blue
BRAND_WHITE  = colors.white
BRAND_GRAY   = colors.HexColor('#e2e8f0')   # Light gray text
BRAND_DARK   = colors.HexColor('#0f172a')   # Near black


def draw_certificate_background(canvas_obj, doc):
    """Draw decorative border & background on each page."""
    canvas_obj.saveState()
    w, h = landscape(A4)

    # Dark navy background
    canvas_obj.setFillColor(BRAND_NAVY)
    canvas_obj.rect(0, 0, w, h, fill=1, stroke=0)

    # Outer gold border
    canvas_obj.setStrokeColor(BRAND_GOLD)
    canvas_obj.setLineWidth(4)
    canvas_obj.rect(18, 18, w - 36, h - 36, fill=0, stroke=1)

    # Inner thin border
    canvas_obj.setStrokeColor(BRAND_GOLD2)
    canvas_obj.setLineWidth(1)
    canvas_obj.rect(28, 28, w - 56, h - 56, fill=0, stroke=1)

    # Corner ornaments — top-left
    canvas_obj.setStrokeColor(BRAND_GOLD)
    canvas_obj.setLineWidth(2)
    for offset in [0, 8]:
        canvas_obj.line(18 + offset, h - 70, 18 + offset, h - 18)
        canvas_obj.line(18, h - 18 - offset, 88, h - 18 - offset)
    # top-right
    for offset in [0, 8]:
        canvas_obj.line(w - 18 - offset, h - 70, w - 18 - offset, h - 18)
        canvas_obj.line(w - 88, h - 18 - offset, w - 18, h - 18 - offset)
    # bottom-left
    for offset in [0, 8]:
        canvas_obj.line(18 + offset, 18, 18 + offset, 70)
        canvas_obj.line(18, 18 + offset, 88, 18 + offset)
    # bottom-right
    for offset in [0, 8]:
        canvas_obj.line(w - 18 - offset, 18, w - 18 - offset, 70)
        canvas_obj.line(w - 88, 18 + offset, w - 18, 18 + offset)

    # Subtle gold star / diamond at center top
    cx = w / 2
    canvas_obj.setFillColor(BRAND_GOLD)
    canvas_obj.setStrokeColor(BRAND_GOLD)
    canvas_obj.setLineWidth(1)
    canvas_obj.circle(cx, h - 28, 5, fill=1, stroke=0)

    canvas_obj.restoreState()


def generate_pdf_and_qr(certificate):
    """Generate QR code and PDF certificate for Savdo Akademiyasi."""

    # Create media subfolders if needed
    os.makedirs(os.path.join(settings.MEDIA_ROOT, 'certificates', 'pdfs'), exist_ok=True)
    os.makedirs(os.path.join(settings.MEDIA_ROOT, 'certificates', 'qrs'), exist_ok=True)

    # ── 1. QR Code ────────────────────────────────────────────────────────────
    verify_url = f"http://localhost:5173/verify/{certificate.certificate_id}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color="#0a1628", back_color="white")
    qr_io = BytesIO()
    qr_img.save(qr_io, format='PNG')
    qr_io.seek(0)

    qr_file_name = f"{certificate.certificate_id}_qr.png"
    certificate.qr_code_image.save(
        qr_file_name,
        ContentFile(qr_io.read()),
        save=False
    )

    # ── 2. PDF Certificate ────────────────────────────────────────────────────
    pdf_io = BytesIO()

    doc = SimpleDocTemplate(
        pdf_io,
        pagesize=landscape(A4),
        leftMargin=55,
        rightMargin=55,
        topMargin=52,
        bottomMargin=52,
    )

    # ── Styles ────────────────────────────────────────────────────────────────
    org_top_style = ParagraphStyle(
        'OrgTop',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=BRAND_GOLD2,
        alignment=1,
        spaceAfter=0,
    )

    org_name_style = ParagraphStyle(
        'OrgName',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=BRAND_GOLD,
        alignment=1,
        spaceAfter=0,
    )

    cert_word_style = ParagraphStyle(
        'CertWord',
        fontName='Helvetica-Bold',
        fontSize=38,
        leading=44,
        textColor=BRAND_GOLD,
        alignment=1,
        spaceAfter=0,
        spaceBefore=0,
    )

    presents_style = ParagraphStyle(
        'Presents',
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=16,
        textColor=BRAND_GRAY,
        alignment=1,
    )

    name_style = ParagraphStyle(
        'StudentName',
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=BRAND_WHITE,
        alignment=1,
    )

    course_style = ParagraphStyle(
        'CourseName',
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=17,
        textColor=BRAND_GOLD2,
        alignment=1,
    )

    meta_style = ParagraphStyle(
        'Meta',
        fontName='Helvetica',
        fontSize=9.5,
        leading=15,
        textColor=BRAND_GRAY,
    )

    footer_style = ParagraphStyle(
        'Footer',
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=12,
        textColor=BRAND_GOLD2,
        alignment=1,
    )

    # ── Story ─────────────────────────────────────────────────────────────────
    story = []

    logo_path = os.path.join(settings.MEDIA_ROOT, 'logo.png')
    if os.path.exists(logo_path):
        logo_img = Image(logo_path, width=0.65 * inch, height=0.65 * inch)
        logo_table = Table([[logo_img]], colWidths=[7.0 * inch])
        logo_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(logo_table)
        story.append(Spacer(1, 4))

    # Org header
    story.append(Paragraph(
        'O\'ZBEKISTON RESPUBLIKASI SOG\'LIQNI SAQLASH VAZIRLIGI LITSENZIYASI ASOSIDA',
        org_top_style
    ))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        '"SAVDO AKADEMIYASI" O\'QUV MARKAZI',
        org_name_style
    ))
    story.append(Spacer(1, 8))

    # Gold divider line
    story.append(HRFlowable(
        width='80%',
        thickness=1.5,
        color=BRAND_GOLD,
        spaceAfter=10,
        spaceBefore=0,
        hAlign='CENTER',
    ))

    # SERTIFIKAT big word
    story.append(Paragraph('SERTIFIKAT', cert_word_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        'ushbu hujjat quyidagi shaxsga berildi:',
        presents_style
    ))
    story.append(Spacer(1, 10))

    # Gold line under presents
    story.append(HRFlowable(
        width='50%',
        thickness=0.8,
        color=BRAND_GOLD2,
        spaceAfter=8,
        spaceBefore=0,
        hAlign='CENTER',
    ))

    # Student name
    student_name = certificate.student.get_full_name()
    if not student_name:
        student_name = f"{certificate.student.first_name} {certificate.student.last_name}".strip()
    if not student_name:
        student_name = certificate.student.username

    story.append(Paragraph(student_name.upper(), name_style))
    story.append(Spacer(1, 10))

    # Course title
    course_title = certificate.course.title
    story.append(Paragraph(
        f'"{course_title}" sanitariya-gigiyena minimumi o\'quv dasturini muvaffaqiyatli yakunlaganligi tasdiqlanadi.',
        course_style
    ))
    story.append(Spacer(1, 16))

    # Bottom divider
    story.append(HRFlowable(
        width='80%',
        thickness=1,
        color=BRAND_GOLD,
        spaceAfter=12,
        spaceBefore=0,
        hAlign='CENTER',
    ))

    # Meta + QR side by side
    now = datetime.now()
    issued_date = certificate.issued_at.strftime('%d.%m.%Y') if certificate.issued_at else now.strftime('%d.%m.%Y')
    expiry_date = certificate.expires_at.strftime('%d.%m.%Y')

    passport_info = ''
    try:
        student = certificate.student
        if student.passport_series and student.passport_number:
            passport_info = f"<b>Pasport:</b> {student.passport_series} {student.passport_number}<br/>"
        if student.jshshir:
            passport_info += f"<b>JSHSHIR:</b> {student.jshshir}<br/>"
        if student.father_name:
            passport_info += f"<b>Otasining ismi:</b> {student.father_name}<br/>"
        if student.birth_date:
            passport_info += f"<b>Tug'ilgan sana:</b> {student.birth_date.strftime('%d.%m.%Y')}<br/>"
        # StudentProfile fields
        try:
            sp = student.student_profile
            if sp.organization:
                passport_info += f"<b>Tashkilot:</b> {sp.organization}<br/>"
        except Exception:
            pass
    except Exception:
        pass

    meta_text = f"""
    <b>Sertifikat ID:</b> {certificate.certificate_id}<br/>
    <b>Berilgan sana:</b> {issued_date}<br/>
    <b>Amal qilish muddati:</b> {expiry_date}<br/>
    {passport_info}<b>Holati:</b> Faol / Haqiqiy
    """

    meta_para = Paragraph(meta_text, meta_style)

    # QR code flowable
    qr_io.seek(0)
    qr_flowable = Image(qr_io, width=1.2 * inch, height=1.2 * inch)

    sig_style = ParagraphStyle(
        'Sig',
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=BRAND_GRAY,
        alignment=1,
    )
    signature_block = Paragraph(
        '<br/><br/>________________________<br/>'
        '<b>Markaz rahbari</b><br/>'
        '"Savdo Akademiyasi" O\'quv Markazi',
        sig_style
    )

    bottom_table = Table(
        [[meta_para, qr_flowable, signature_block]],
        colWidths=[3.2 * inch, 1.5 * inch, 3.2 * inch],
    )
    bottom_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('ALIGN', (2, 0), (2, 0), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))

    story.append(bottom_table)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Sertifikatning haqiqiyligini tekshirish uchun QR kodni skanerlang yoki: "
        f"localhost:5173/verify/{certificate.certificate_id}",
        footer_style
    ))

    # Build PDF with custom background
    doc.build(story, onFirstPage=draw_certificate_background, onLaterPages=draw_certificate_background)

    pdf_io.seek(0)
    pdf_file_name = f"{certificate.certificate_id}.pdf"
    certificate.pdf_file.save(
        pdf_file_name,
        ContentFile(pdf_io.read()),
        save=False
    )
