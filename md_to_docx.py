import re
import zipfile
from xml.sax.saxutils import escape
from pathlib import Path

md_path = Path("/Users/sebastian/Library/CloudStorage/GoogleDrive-sebas.lopez1984@gmail.com/Mi unidad/AWS/examenes_aws/chuleta_repaso.md")
docx_path = Path("/Users/sebastian/Library/CloudStorage/GoogleDrive-sebas.lopez1984@gmail.com/Mi unidad/AWS/examenes_aws/chuleta_repaso.docx")

text = md_path.read_text(encoding="utf-8")

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

def xml_escape(s: str) -> str:
    return escape(s, {'"': "&quot;", "'": "&apos;"})

def parse_inline_to_runs(s: str, default_bold: bool = False, default_color: str = None, default_size: int = None) -> str:
    """
    Parse markdown inline formatting (**bold**, *italic*, _italic_, `code`, [label](url), <br>)
    and emit <w:r> elements.
    """
    s = s.replace(r"\$", "$").replace(r"\*", "*")
    # Strip markdown links [label](url) -> label
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", s)

    # Split by <br> or <br/>
    parts_br = re.split(r"<br\s*/?>", s)
    runs_xml = []

    token_re = re.compile(r"(\*\*[^*]+\*\*|`[^`]+`|(?<!\*)\*[^*]+\*(?!\*)|_[^_]+_)")

    for b_idx, part in enumerate(parts_br):
        if b_idx > 0:
            runs_xml.append("<w:r><w:br/></w:r>")
        tokens = token_re.split(part)
        for tok in tokens:
            if not tok:
                continue
            bold = default_bold
            italic = False
            is_code = False
            content = tok
            if tok.startswith("**") and tok.endswith("**") and len(tok) > 4:
                bold = True
                content = tok[2:-2]
            elif tok.startswith("`") and tok.endswith("`") and len(tok) > 2:
                is_code = True
                content = tok[1:-1]
            elif (tok.startswith("*") and tok.endswith("*") and len(tok) > 2) or (tok.startswith("_") and tok.endswith("_") and len(tok) > 2):
                italic = True
                content = tok[1:-1]

            # Check nested ** inside content if any
            rpr = []
            if is_code:
                rpr.append('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>')
                rpr.append('<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>')
            if bold:
                rpr.append("<w:b/>")
            if italic:
                rpr.append("<w:i/>")
            if default_color:
                rpr.append(f'<w:color w:val="{default_color}"/>')
            if default_size:
                rpr.append(f'<w:sz w:val="{default_size}"/><w:szCs w:val="{default_size}"/>')

            rpr_xml = f"<w:rPr>{''.join(rpr)}</w:rPr>" if rpr else ""
            runs_xml.append(f'<w:r>{rpr_xml}<w:t xml:space="preserve">{xml_escape(content)}</w:t></w:r>')

    return "".join(runs_xml)

def make_paragraph(text_str: str, style: str = "Normal", indent_left: int = 0, is_quote: bool = False, is_hr: bool = False) -> str:
    ppr = [f'<w:pStyle w:val="{style}"/>']
    if indent_left > 0:
        ppr.append(f'<w:ind w:left="{indent_left}"/>')
    if is_quote:
        ppr.append('<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="64748B"/></w:pBdr>')
        ppr.append('<w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>')
        ppr.append('<w:ind w:left="240" w:right="120"/>')
    if is_hr:
        ppr.append('<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr>')
        return f"<w:p><w:pPr>{''.join(ppr)}</w:pPr></w:p>"

    bold_heading = style in ("Heading1", "Heading2", "Heading3", "Heading4")
    runs = parse_inline_to_runs(text_str, default_bold=bold_heading)
    return f"<w:p><w:pPr>{''.join(ppr)}</w:pPr>{runs}</w:p>"

def make_table(rows: list) -> str:
    tbl_pr = """
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="80" w:type="dxa"/>
        <w:left w:w="120" w:type="dxa"/>
        <w:bottom w:w="80" w:type="dxa"/>
        <w:right w:w="120" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    """
    tr_xmls = []
    for r_idx, row in enumerate(rows):
        is_header = (r_idx == 0)
        tc_xmls = []
        for cell in row:
            shd = '<w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/>' if is_header else ""
            tc_pr = f"<w:tcPr>{shd}</w:tcPr>"
            runs = parse_inline_to_runs(cell, default_bold=is_header)
            tc_xmls.append(f"<w:tc>{tc_pr}<w:p><w:pPr><w:spacing w:before=\"20\" w:after=\"20\"/></w:pPr>{runs}</w:p></w:tc>")
        tr_xmls.append(f"<w:tr>{''.join(tc_xmls)}</w:tr>")
    return f"<w:tbl>{tbl_pr}{''.join(tr_xmls)}</w:tbl>"

lines = text.splitlines()
body_elements = []
i = 0
n = len(lines)

while i < n:
    line = lines[i]
    stripped = line.strip()

    if not stripped:
        i += 1
        continue

    if stripped == "---":
        body_elements.append(make_paragraph("", is_hr=True))
        i += 1
        continue

    # Code block
    if stripped.startswith("```"):
        i += 1
        while i < n and not lines[i].strip().startswith("```"):
            code_line = lines[i]
            ppr = '<w:pPr><w:pStyle w:val="Normal"/><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/><w:spacing w:before="0" w:after="0"/></w:pPr>'
            rpr = '<w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/></w:rPr>'
            body_elements.append(f'<w:p>{ppr}<w:r>{rpr}<w:t xml:space="preserve">{xml_escape(code_line)}</w:t></w:r></w:p>')
            i += 1
        i += 1
        continue

    # Headings
    m_h = re.match(r"^(#{1,4})\s+(.*)$", stripped)
    if m_h:
        level = len(m_h.group(1))
        body_elements.append(make_paragraph(m_h.group(2), style=f"Heading{level}"))
        i += 1
        continue

    # Table
    if stripped.startswith("|") and stripped.endswith("|"):
        rows = []
        while i < n and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
            rline = lines[i].strip()
            cells = [c.strip() for c in rline.strip("|").split("|")]
            if not (all(re.match(r"^:?-{2,}:?$", c) for c in cells if c != "") and any(c != "" for c in cells)):
                rows.append(cells)
            i += 1
        if rows:
            body_elements.append(make_table(rows))
            body_elements.append(make_paragraph(""))
        continue

    # Blockquote
    if stripped.startswith(">"):
        bq_lines = []
        while i < n and lines[i].strip().startswith(">"):
            c = re.sub(r"^>\s?", "", lines[i].strip())
            if c:
                bq_lines.append(c)
            i += 1
        if bq_lines:
            body_elements.append(make_paragraph("<br>".join(bq_lines), is_quote=True))
        continue

    # Bullet or numbered list
    m_ul = re.match(r"^(\s*)([-*])\s+(.*)$", line)
    m_ol = re.match(r"^(\s*)(\d+\.)\s+(.*)$", line)
    if m_ul or m_ol:
        m = m_ul if m_ul else m_ol
        indent_spaces = len(m.group(1))
        prefix = "• " if m_ul else f"{m.group(2)} "
        if indent_spaces >= 2:
            prefix = "◦ " if m_ul else f"{m.group(2)} "
        item_text = prefix + m.group(3)
        i += 1
        # Check continuation lines
        while i < n:
            nxt = lines[i]
            nxt_s = nxt.strip()
            if nxt.startswith("  ") and nxt_s and not re.match(r"^([-*]|\d+\.)\s+", nxt_s) and not nxt_s.startswith(("#", "|", ">", "```")):
                item_text += " " + nxt_s
                i += 1
            else:
                break
        indent_twips = 360 if indent_spaces < 2 else 720
        body_elements.append(make_paragraph(item_text, indent_left=indent_twips))
        continue

    # Normal paragraph
    p_lines = [stripped]
    i += 1
    while i < n:
        nxt = lines[i].strip()
        if not nxt or nxt == "---" or nxt.startswith(("#", "|", ">", "```", "- ", "* ")) or re.match(r"^\d+\.\s+", nxt):
            break
        p_lines.append(nxt)
        i += 1
    body_elements.append(make_paragraph(" ".join(p_lines)))

document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{W_NS}">
  <w:body>
    {''.join(body_elements)}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""

styles_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="{W_NS}">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="es-AR"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:before="40" w:after="80" w:line="260" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="1A365D"/>
      <w:sz w:val="36"/>
      <w:szCs w:val="36"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="220" w:after="100"/>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="6" w:space="2" w:color="93C5FD"/>
      </w:pBdr>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="1E40AF"/>
      <w:sz w:val="28"/>
      <w:szCs w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="160" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="0F172A"/>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="120" w:after="40"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="334155"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>
"""

content_types_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
"""

rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

doc_rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""

with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("[Content_Types].xml", content_types_xml.strip())
    zf.writestr("_rels/.rels", rels_xml.strip())
    zf.writestr("word/_rels/document.xml.rels", doc_rels_xml.strip())
    zf.writestr("word/document.xml", document_xml.strip())
    zf.writestr("word/styles.xml", styles_xml.strip())

print("Successfully created:", docx_path, "Size:", docx_path.stat().st_size, "bytes")
