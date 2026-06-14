import {
  Document, Packer, Paragraph, TextRun, Table, TableRow,
  TableCell, AlignmentType, BorderStyle, WidthType,
  ShadingType, Header, Footer, PageNumber, HeadingLevel
} from 'docx'
import { saveAs } from 'file-saver'

/**
 * exportCaseAsDoc
 * @param {object}  caseData      — raw Supabase cases row (snake_case fields)
 * @param {Array}   laws          — draft.identified_laws[]
 * @param {string}  draftText     — draft.draft_text
 * @param {object}  advocateData  — { name, bar_council_no }
 * @param {object}  draft         — full draft row (for version number)
 */
export async function exportCaseAsDoc(caseData, laws, draftText, advocateData, draft) {

  const lawsArray      = Array.isArray(laws)     ? laws     : []
  const draftTextSafe  = typeof draftText === 'string' ? draftText : ''
  const advName        = advocateData?.name         || 'Advocate'
  const advBarNo       = advocateData?.bar_council_no || '___________'
  const courtName      = caseData.court_level?.toUpperCase() || ''
  const place          = caseData.incident_place?.toUpperCase() || ''
  const caseType       = caseData.case_type || ''
  const plaintiff      = caseData.plaintiff_name?.toUpperCase() || ''
  const defendant      = caseData.defendant_name?.toUpperCase() || ''
  const draftVersion   = draft?.version || 1

  const todayReadable  = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

  // ── Helper: isAllCaps heading line ──────────────────────────────
  function isHeadingLine(line) {
    const t = line.trim()
    return t.length > 0 && t.length < 80 && t === t.toUpperCase()
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 }
        }
      }
    },

    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 }
        }
      },

      // ── Header ────────────────────────────────────────────────────
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: 'VakalatNama — AI Assisted Legal Draft',
              bold: true, size: 18, color: '888888'
            })]
          })]
        })
      },

      // ── Footer ────────────────────────────────────────────────────
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'AI-generated — reviewed and consented by advocate | Page ',
                size: 16, color: '888888'
              }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888' }),
              new TextRun({ text: ' of ', size: 16, color: '888888' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '888888' }),
            ]
          })]
        })
      },

      children: [

        // ─────────────────────────────────────────────────────────────
        // COURT HEADING
        // ─────────────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({
            text: `IN THE COURT OF ${courtName}`,
            bold: true, size: 32, allCaps: true
          })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({
            text: place, bold: true, size: 26
          })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 500 },
          children: [new TextRun({
            text: `Case Type: ${caseType}`, size: 22, italics: true
          })]
        }),

        // ─────────────────────────────────────────────────────────────
        // CAUSE TITLE — Plaintiff vs Defendant
        // ─────────────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: plaintiff, bold: true, size: 28 })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: '...Plaintiff / Complainant', size: 22, italics: true })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: 'VERSUS', bold: true, size: 26 })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: defendant, bold: true, size: 28 })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: '...Defendant / Accused', size: 22, italics: true })]
        }),

        // ─────────────────────────────────────────────────────────────
        // HORIZONTAL RULE
        // ─────────────────────────────────────────────────────────────
        new Paragraph({
          border: { bottom: { color: '000000', size: 6, style: BorderStyle.SINGLE } },
          spacing: { after: 400 }
        }),

        // ─────────────────────────────────────────────────────────────
        // SECTION 1: IDENTIFIED LAWS TABLE
        // ─────────────────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 200, after: 300 },
          children: [new TextRun({
            text: 'IDENTIFIED APPLICABLE LAWS & SECTIONS',
            bold: true, size: 24, allCaps: true, underline: {}
          })]
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header row
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '0A0E1A' },
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Section', bold: true, size: 20, color: 'C9A84C' })]
                  })]
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '0A0E1A' },
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Act / Statute', bold: true, size: 20, color: 'C9A84C' })]
                  })]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: '0A0E1A' },
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Why It Applies', bold: true, size: 20, color: 'C9A84C' })]
                  })]
                }),
              ]
            }),
            // Data rows
            ...lawsArray.map((law, i) => new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF' },
                  children: [new Paragraph({
                    children: [new TextRun({ text: law.section || '', bold: true, size: 20 })]
                  })]
                }),
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF' },
                  children: [new Paragraph({
                    children: [new TextRun({ text: law.act || '', size: 20 })]
                  })]
                }),
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF' },
                  children: [new Paragraph({
                    children: [new TextRun({ text: law.explanation || law.description || '', size: 20, italics: true })]
                  })]
                }),
              ]
            }))
          ]
        }),

        // ─────────────────────────────────────────────────────────────
        // SECTION 2: LEGAL DRAFT BODY
        // ─────────────────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 600, after: 300 },
          children: [new TextRun({
            text: 'LEGAL DRAFT / PETITION',
            bold: true, size: 24, allCaps: true, underline: {}
          })]
        }),

        ...draftTextSafe.split('\n').map(line => new Paragraph({
          spacing: { after: 160 },
          alignment: isHeadingLine(line) ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          children: [new TextRun({
            text: line || ' ',
            size: 22,
            bold: isHeadingLine(line)
          })]
        })),

        // ─────────────────────────────────────────────────────────────
        // SIGNATURE BLOCK
        // ─────────────────────────────────────────────────────────────
        new Paragraph({ spacing: { before: 800, after: 200 } }),

        new Paragraph({
          children: [new TextRun({
            text: `Place: ${caseData.incident_place || '___________'}`,
            size: 22
          })]
        }),

        new Paragraph({
          spacing: { after: 600 },
          children: [new TextRun({ text: `Date: ${todayReadable}`, size: 22 })]
        }),

        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
          children: [new TextRun({ text: '____________________________', size: 22 })]
        }),

        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 60 },
          children: [new TextRun({ text: advName, bold: true, size: 22 })]
        }),

        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 60 },
          children: [new TextRun({ text: `Bar Council No: ${advBarNo}`, size: 20, italics: true })]
        }),

        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'Advocate for the Plaintiff', size: 20 })]
        }),

        // ─────────────────────────────────────────────────────────────
        // CONSENT VERIFICATION STAMP
        // ─────────────────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 400 },
          border: { top: { color: '22C55E', size: 4, style: BorderStyle.SINGLE } },
          children: [new TextRun({
            text: `CONSENT VERIFIED — This document was reviewed and consented to by ${advName} ` +
                  `(Bar Council No: ${advBarNo}) on ${nowIST} IST. ` +
                  `Draft Version: v${draftVersion}.`,
            size: 18, color: '1A7A3A', bold: true
          })]
        }),

        // ─────────────────────────────────────────────────────────────
        // DISCLAIMER
        // ─────────────────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 300 },
          border: { top: { color: 'CCCCCC', size: 4, style: BorderStyle.SINGLE } },
          children: [new TextRun({
            text: 'DISCLAIMER: This document was AI-assisted by VakalatNama and has been ' +
                  'reviewed and consented to by the advocate named above. ' +
                  'VakalatNama does not provide legal advice. ' +
                  'This document must be independently verified before filing in court.',
            size: 16, color: '888888', italics: true
          })]
        }),

      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  const pName = (caseData.plaintiff_name || 'Plaintiff').replace(/[^a-zA-Z0-9]/g, '_')
  const dName = (caseData.defendant_name || 'Defendant').replace(/[^a-zA-Z0-9]/g, '_')
  const dateStr = new Date().toISOString().split('T')[0]
  const fileName = `VakalatNama_${pName}_vs_${dName}_v${draftVersion}_${dateStr}.docx`
  saveAs(blob, fileName)
}
