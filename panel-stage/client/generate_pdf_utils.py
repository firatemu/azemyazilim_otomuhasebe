import os

def generate_pdf_utils():
    with open('roboto_regular_b64.txt', 'r') as f:
        regular_b64 = f.read().strip()
    
    with open('roboto_bold_b64.txt', 'r') as f:
        bold_b64 = f.read().strip()

    content = f"""'use js';
import jsPDF from 'jspdf';

// Font data (Roboto)
const ROBOTO_REGULAR = '{regular_b64}';
const ROBOTO_BOLD = '{bold_b64}';

export const registerFonts = (doc: jsPDF) => {{
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR);
    doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');
}};

export const drawHeader = (doc: jsPDF, title: string, subtitle: string) => {{
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header Background
    doc.setFillColor(15, 23, 42); // var(--primary)
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Branding
    doc.setTextColor(255, 255, 255);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(24);
    doc.text('OTOMUHASEBE', 20, 25);

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text(subtitle, 20, 36);
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text(title, pageWidth - 20, 25, {{ align: 'right' }});
    
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('tr-TR'), pageWidth - 20, 36, {{ align: 'right' }});
}};

export const drawTable = (doc: jsPDF, startY: number, headers: string[], rows: any[][], colWidths: number[]) => {{
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = startY;

    // Table Header
    doc.setFillColor(248, 250, 252);
    doc.rect(20, y, pageWidth - 40, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, pageWidth - 20, y);
    doc.line(20, y + 10, pageWidth - 20, y + 10);

    doc.setFontSize(9);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(71, 85, 105);

    let x = 20;
    headers.forEach((header, i) => {{
        doc.text(header, x + 2, y + 6.5);
        x += colWidths[i];
    }});

    y += 10;
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(15, 23, 42);

    rows.forEach((row) => {{
        if (y > 270) {{
            doc.addPage();
            y = 20;
            // Redraw header on new page if needed or just skip for simplicity
        }}

        x = 20;
        row.forEach((cell, i) => {{
            const cellStr = String(cell || '-');
            doc.text(cellStr, x + 2, y + 6.5);
            x += colWidths[i];
        }});

        doc.setDrawColor(241, 245, 249);
        doc.line(20, y + 10, pageWidth - 20, y + 10);
        y += 10;
    }});

    return y;
}};
"""
    with open('src/lib/pdf-utils.ts', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    generate_pdf_utils()
