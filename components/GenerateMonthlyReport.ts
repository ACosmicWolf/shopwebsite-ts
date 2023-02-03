import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export default function GenerateReport(
  date: string,
  items: any,
  total: number,
  advance: number,
  calculated: number,
  employeeName: string,
  employeeType: string
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

  doc.text("Monthly Report", 1.5, 1.5, {
    align: "center",
    renderingMode: "fill",
  });

  doc.setFontSize(12);

  doc.setFont("courier", "bold");

  doc.text(`Date: ${date}`, 1, 1.8, {
    align: "center",
    renderingMode: "fill",
  });

  /* Employee Name */

  doc.setFont("courier", "bold");

  doc.text(`Employee Name: ${employeeName}`, 0.5, 2.5, {
    renderingMode: "fill",
    align: "left",
  });

  /* Employee Type */

  doc.text(`Employee Type: ${employeeType}`, 0.5, 2.8, {
    renderingMode: "fill",
    align: "left",
  });

  const emptyCol = {
    content: "",
    styles: {
      fillColor: "#FFFFFF",
      lineWidth: 0,
    },
  };

  autoTable(doc, {
    startY: 4,
    head: [["Category", "Subcategory", "Date", "Price", "Quantity", "Total"]],
    body: items,
    bodyStyles: {
      halign: "center",
    },
    headStyles: {
      halign: "center",
      fillColor: "#f5f5f5",
      textColor: "#000",
    },

    styles: {
      halign: "center",
      lineColor: "#b8b7b7",
      lineWidth: 0.01,
      fillColor: "#fff",
      textColor: "#000",
      font: "courier",
    },

    alternateRowStyles: {
      fillColor: "#fff",
    },

    footStyles: {
      halign: "center",
      lineWidth: 0,
    },

    theme: "striped",
  });

  autoTable(doc, {
    body: [
      [
        emptyCol,
        emptyCol,
        emptyCol,
        emptyCol,
        {
          content: "Total",
          styles: {
            halign: "right",
          },
        },
        {
          content: total,
          styles: { lineWidth: 0.01, halign: "right", fontStyle: "bold" },
        },
      ],
      [
        emptyCol,
        emptyCol,
        emptyCol,
        emptyCol,
        {
          content: "Advance",
          styles: {
            halign: "right",
          },
        },
        {
          content: advance,
          styles: { lineWidth: 0.01, halign: "right", fontStyle: "bold" },
        },
      ],
      [
        emptyCol,
        emptyCol,
        emptyCol,
        emptyCol,
        {
          content: "Calculated Amount",
          styles: {
            halign: "right",
          },
        },
        {
          content: calculated,
          styles: {
            lineWidth: 0.01,
            halign: "right",
            fontStyle: "bold",
          },
        },
      ],
    ],

    styles: {
      halign: "center",
      lineColor: "#b8b7b7",
      lineWidth: 0,
      fillColor: "#fff",
      textColor: "#000",
      font: "courier",
    },

    alternateRowStyles: {
      fillColor: "#fff",
    },
    theme: "plain",
  });

  doc.save(`montlyreport-${date}.pdf`);
}
