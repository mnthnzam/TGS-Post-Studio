// Minimal zero-dependency PDF writer: one full-page JPEG per page.
// jpegs: raw JPEG byte-strings (Latin1, one char per byte). imgW/imgH = pixel size.

export function imagesToPdf(jpegs: string[], imgW: number, imgH: number, pageW = 595, pageH = 842): Blob {
  const n = jpegs.length;
  const offsets: number[] = [];
  let pdf = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';

  const addObj = (id: number, body: string) => {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${body}\nendobj\n`;
  };

  const pageIds: number[] = [];
  for (let i = 0; i < n; i++) pageIds.push(5 + i * 3);
  const totalObjs = 2 + n * 3;

  addObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObj(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${n} >>`);

  for (let i = 0; i < n; i++) {
    const imgId = 3 + i * 3, contentId = 4 + i * 3, pageId = 5 + i * 3;
    const jpeg = jpegs[i];
    // image XObject (binary stream)
    offsets[imgId] = pdf.length;
    pdf += `${imgId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`;
    pdf += jpeg + '\nendstream\nendobj\n';
    // content stream — scale unit square to the page
    const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im Do Q`;
    addObj(contentId, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    // page
    addObj(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  }

  const xrefPos = pdf.length;
  let xref = `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= totalObjs; id++) xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  pdf += xref;
  pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: 'application/pdf' });
}
