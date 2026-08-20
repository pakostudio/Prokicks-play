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
  // Plantilla oficial ProKicks x Indoor Community (tamaño Carta).
  const width = 612;
  const height = 792;
  const centerX = width / 2;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [width, height] });

  try {
    const template = await toDataUrl('/certificate-template.png');
    doc.addImage(template, 'PNG', 0, 0, width, height);
  } catch {
    // si falla la carga de la plantilla, seguimos con fondo blanco
  }

  // Nombre del participante, centrado en el espacio en blanco de la plantilla
  // (entre "Este reconocimiento se otorga a:" y "Por su destacada participación...").
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.setTextColor(23, 59, 99);
  wrapCentered(doc, opts.participantName || 'Participante', 472, width - 100, centerX, 40);

  const safeName = (opts.participantName || 'participante').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(opts.fileName || `reconocimiento-${safeName}.pdf`);
}
