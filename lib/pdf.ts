import type { BriefProject } from "./storage";

export async function downloadBriefPDF(project: BriefProject): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const ink = [15, 14, 13] as [number, number, number];
  const accent = [212, 82, 42] as [number, number, number];
  const muted = [138, 128, 112] as [number, number, number];
  const cream = [237, 232, 220] as [number, number, number];

  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;

  // Header background
  doc.setFillColor(...ink);
  doc.rect(0, 0, W, 40, "F");

  // Logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Context", margin, 22);
  doc.setTextColor(...accent);
  doc.text("Drop", margin + 30, 22);

  // Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Brief client structuré", margin, 32);

  // Project name
  doc.setTextColor(...ink);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(project.name, margin, 58);

  // Date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  const dateStr = new Date(project.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Généré le ${dateStr}`, margin, 66);

  // Divider
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(margin, 71, W - margin, 71);

  let y = 82;

  if (project.briefData) {
    const { summary, objective, audience, budget, deadline, tech_constraints, references } = project.briefData;

    // Summary box
    doc.setFillColor(...cream);
    doc.roundedRect(margin, y, contentW, 2, 0, 0, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text("Résumé du projet", margin, y + 10);
    y += 14;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 48, 46);
    const summaryLines = doc.splitTextToSize(summary, contentW);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5.5 + 12;

    // Fields
    const fields = [
      { label: "Objectif principal", value: objective },
      { label: "Public cible", value: audience },
      { label: "Budget", value: budget },
      { label: "Délais", value: deadline },
      { label: "Contraintes techniques", value: tech_constraints },
      { label: "Références & inspirations", value: references },
    ];

    for (const field of fields) {
      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accent);
      doc.text(field.label.toUpperCase(), margin, y);
      y += 5;

      // Value
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...ink);
      const lines = doc.splitTextToSize(field.value, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 5.5;

      // Separator
      doc.setDrawColor(...[216, 208, 192] as [number, number, number]);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 3, W - margin, y + 3);
      y += 10;

      // New page if needed
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
  }

  // Footer
  doc.setFillColor(...ink);
  doc.rect(0, 285, W, 12, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.text("Généré par ContextDrop — contextdrop.com", margin, 293);
  doc.setTextColor(255, 255, 255);
  doc.text(`ID: ${project.id}`, W - margin, 293, { align: "right" });

  doc.save(`brief-${project.id}.pdf`);
}
