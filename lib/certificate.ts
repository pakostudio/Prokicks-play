async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function wrapCentered(doc: any, text: string, y: number, maxWidth: number, pageCenterX: number, lineHeight: number) {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((line: string, index: number) => {
    doc.text(line, pageCenterX, y + index * lineHeight, { align: 'center' });
  });
  return lines.length;
}

export async function downloadTournamentCertificate(opts: {
  participantName: string;
  tournamentTitle: string;
  venue?: string | null;
  dateLabel?: string | null;
  fileName?: string;
}) {
  const { default: jsPDF } = await import('jspdf');
  const width = 540;
  const height = 960;
  const centerX = width / 2;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [width, height] });

  // Marco
  doc.setDrawColor(23, 59, 99);
  doc.setLineWidth(1.5);
  doc.rect(24, 24, width - 48, height - 48);
  doc.setDrawColor(200, 210, 225);
  doc.setLineWidth(0.75);
  doc.rect(32, 32, width - 64, height - 64);

  try {
    const prokicksLogo = await toDataUrl('/logo-negro.png');
    doc.addImage(prokicksLogo, 'PNG', centerX - 75, 66, 150, 48);
  } catch {
    // si falla la carga del logo, seguimos sin él
  }

  doc.setTextColor(23, 59, 99);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('R E C O N O C I M I E N T O', centerX, 150, { align: 'center' });

  doc.setDrawColor(23, 59, 99);
  doc.setLineWidth(1);
  doc.line(centerX - 60, 168, centerX + 60, 168);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(100, 110, 130);
  doc.text('Se otorga el presente reconocimiento a', centerX, 400, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(23, 59, 99);
  wrapCentered(doc, opts.participantName || 'Participante', 450, width - 120, centerX, 38);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(100, 110, 130);
  doc.text('por su destacada participación en', centerX, 520, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(23, 59, 99);
  const titleLines = wrapCentered(doc, opts.tournamentTitle || 'Torneo ProKicks', 550, width - 120, centerX, 24);

  const infoY = 550 + titleLines * 24 + 26;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(120, 130, 150);
  const infoLine = [opts.venue, opts.dateLabel].filter(Boolean).join(' · ');
  if (infoLine) doc.text(infoLine, centerX, infoY, { align: 'center' });

  doc.setDrawColor(200, 210, 225);
  doc.setLineWidth(0.75);
  doc.line(centerX - 90, 870, centerX + 90, 870);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 59, 99);
  doc.text('INDOOR COMMUNITY F.C.', centerX, 894, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 158, 175);
  doc.text('prokicksplay.com', centerX, 928, { align: 'center' });

  const safeName = (opts.participantName || 'participante').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(opts.fileName || `reconocimiento-${safeName}.pdf`);
}
