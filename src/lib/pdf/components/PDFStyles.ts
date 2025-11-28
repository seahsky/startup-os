import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  // Page and Layout
  page: {
    padding: 40,
    paddingBottom: 100, // Reserve space for fixed footer
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937", // gray-800
  },

  // Header Styles
  header: {
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827", // gray-900
  },
  companyDetails: {
    fontSize: 9,
    color: "#6b7280", // gray-500
    lineHeight: 1.4,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827", // gray-900
    textAlign: "right",
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 12,
    color: "#6b7280", // gray-500
    textAlign: "right",
  },

  // Section Headers
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    color: "#111827", // gray-900
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Customer and Document Info Grid
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 20,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6b7280", // gray-500
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 10,
    color: "#111827", // gray-900
    marginBottom: 8,
  },
  infoBold: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827", // gray-900
    marginBottom: 8,
  },

  // Address Block
  addressBlock: {
    padding: 12,
    backgroundColor: "#f9fafb", // gray-50
    borderRadius: 4,
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#374151", // gray-700
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  addressText: {
    fontSize: 9,
    color: "#4b5563", // gray-600
    lineHeight: 1.4,
  },

  // Table Styles
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6", // gray-100
    borderBottom: "2px solid #d1d5db", // gray-300
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb", // gray-200
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  // Table Columns
  colItem: {
    width: "40%",
  },
  colQty: {
    width: "10%",
    textAlign: "right",
  },
  colUnitPrice: {
    width: "15%",
    textAlign: "right",
  },
  colTax: {
    width: "15%",
    textAlign: "right",
  },
  colTotal: {
    width: "20%",
    textAlign: "right",
  },

  // Item Details
  itemName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#111827",
  },
  itemDescription: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.3,
  },

  // Totals Section
  totalsSection: {
    marginTop: 16,
    marginLeft: "auto",
    width: "45%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottom: "1px solid #e5e7eb",
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#4b5563",
  },
  totalLabelBold: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 10,
    color: "#111827",
  },
  totalValueBold: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },

  // Tax Breakdown
  taxBreakdown: {
    marginTop: 4,
    paddingLeft: 12,
  },
  taxBreakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  taxBreakdownLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  taxBreakdownValue: {
    fontSize: 8,
    color: "#6b7280",
  },

  // Payment Status (for invoices)
  paymentPaid: {
    color: "#059669", // green-600
  },
  paymentDue: {
    color: "#dc2626", // red-600
  },

  // Notes and Terms
  notesSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px solid #d1d5db",
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#374151",
  },
  notesText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    paddingTop: 12,
    paddingBottom: 12,
    borderTop: "1px solid #d1d5db",
    fontSize: 8,
    color: "#9ca3af", // gray-400
  },
  footerText: {
    textAlign: "center",
    lineHeight: 1.4,
  },
  pageNumber: {
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 4,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusDraft: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  },
  statusSent: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusOverdue: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },

  // Divider
  divider: {
    borderBottom: "1px solid #e5e7eb",
    marginVertical: 12,
  },

  // Spacing Utilities
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },

  // Text Utilities
  textBold: {
    fontWeight: "bold",
  },
  textRight: {
    textAlign: "right",
  },
  textCenter: {
    textAlign: "center",
  },
  textSmall: {
    fontSize: 8,
  },
  textMuted: {
    color: "#6b7280",
  },

  // Payment Information Styles
  paymentInfoSection: {
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc", // slate-50
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6", // blue-500
    borderLeftStyle: "solid",
  },
  paymentInfoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e40af", // blue-800
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentInfoGrid: {
    flexDirection: "column",
    gap: 4,
  },
  paymentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentInfoLabel: {
    fontSize: 9,
    color: "#64748b", // slate-500
    width: 100,
  },
  paymentInfoValue: {
    fontSize: 9,
    color: "#1e293b", // slate-800
    fontWeight: "bold",
  },
});
