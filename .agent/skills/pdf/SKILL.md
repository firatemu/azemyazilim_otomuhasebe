---
name: pdf
description: Extract text, tables, metadata, merge & annotate PDFs using pypdf, pdfplumber, or reportlab.
---

# PDF Processing

Extract text, tables, metadata, and create PDFs.

## Python Libraries
- **pypdf**: Basic operations like merging, splitting, watermarking.
- **pdfplumber**: Best for text and table extraction.
- **reportlab**: Standard for generating complex PDFs from scratch.

## Common Tasks
- Extract text from scanned/native PDFs.
- Add watermarks or annotations.
- Extract images.
- Merge multiple documents.

## Performance Tip
- Use `pdftotext` (poppler-utils) for high-performance text extraction if available.
