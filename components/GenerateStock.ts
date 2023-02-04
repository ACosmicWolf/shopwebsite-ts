import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export default function GenerateStock(
  stock: string[][],
  totalQuantity: number
) {
  var doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
  });

  doc.setFontSize(40);

  doc.setFont("courier", "bold");

  doc.text("MEHTA UDYOG", 4, 1, { align: "center", renderingMode: "fill" });

  doc.setFontSize(20);

  doc.setFont("courier", "bold");

  doc.text("Stock Report", 1.5, 1.5, {
    align: "center",
    renderingMode: "fill",
  });

  doc.setFontSize(12);

  doc.setFont("courier", "bold");

  autoTable(doc, {
    head: [["Category", "Subcategory", "Quantity"]],
    body: stock,
    startY: 2,
    theme: "grid",
    styles: {
      halign: "center",
      lineWidth: 0.02,
      font: "courier",
    },
    foot: [
      [
        {
          content: "",
          styles: {
            fillColor: "#FFFFFF",
            lineWidth: 0,
          },
        },
        {
          content: "Total Quantity",
          styles: {
            fillColor: "#FFFFFF",
            lineWidth: 0,
            halign: "right",
            textColor: "#000000",
            fontStyle: "bold",
          },
        },
        totalQuantity,
      ],
    ],
  });

  doc.save(`Stock.pdf`);
}
