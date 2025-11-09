import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';
import {
  formatCurrencyForPDF,
  formatCurrencySymbolForPDF,
  getTaxBreakdown,
  formatTaxRate,
} from '../utils/pdfHelpers';
import type { DocumentItem } from '@/lib/types/document';

interface PDFItemsTableProps {
  items: DocumentItem[];
  subtotal: number;
  totalTax: number;
  total: number;
  currency: string;
  showTaxBreakdown?: boolean;
  // For invoices
  amountPaid?: number;
  amountDue?: number;
}

export function PDFItemsTable({
  items,
  subtotal,
  totalTax,
  total,
  currency,
  showTaxBreakdown = true,
  amountPaid,
  amountDue,
}: PDFItemsTableProps) {
  const taxBreakdown = showTaxBreakdown ? getTaxBreakdown(items) : [];

  return (
    <View style={pdfStyles.table}>
      {/* Table Header */}
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.colItem}>Item</Text>
        <Text style={pdfStyles.colQty}>Qty</Text>
        <Text style={pdfStyles.colUnitPrice}>Unit Price</Text>
        <Text style={pdfStyles.colTax}>Tax</Text>
        <Text style={pdfStyles.colTotal}>Total</Text>
      </View>

      {/* Table Rows */}
      {items.map((item, index) => (
        <View
          key={index}
          style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}
        >
          <View style={pdfStyles.colItem}>
            <Text style={pdfStyles.itemName}>{item.name}</Text>
            {item.description && (
              <Text style={pdfStyles.itemDescription}>{item.description}</Text>
            )}
          </View>
          <Text style={pdfStyles.colQty}>{item.quantity}</Text>
          <Text style={pdfStyles.colUnitPrice}>
            {formatCurrencySymbolForPDF(item.unitPrice, currency)}
          </Text>
          <Text style={pdfStyles.colTax}>
            {formatCurrencySymbolForPDF(item.taxAmount, currency)}
          </Text>
          <Text style={[pdfStyles.colTotal, pdfStyles.textBold]}>
            {formatCurrencySymbolForPDF(item.total, currency)}
          </Text>
        </View>
      ))}

      {/* Totals Section */}
      <View style={pdfStyles.totalsSection}>
        {/* Subtotal */}
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>Subtotal:</Text>
          <Text style={pdfStyles.totalValue}>
            {formatCurrencyForPDF(subtotal, currency)}
          </Text>
        </View>

        {/* Tax Breakdown */}
        {taxBreakdown.length > 0 && (
          <View style={pdfStyles.totalRow}>
            <View style={{ flex: 1 }}>
              <Text style={pdfStyles.totalLabel}>Tax:</Text>
              <View style={pdfStyles.taxBreakdown}>
                {taxBreakdown.map((tax, index) => (
                  <View key={index} style={pdfStyles.taxBreakdownItem}>
                    <Text style={pdfStyles.taxBreakdownLabel}>
                      {formatTaxRate(tax.rate)} on{' '}
                      {formatCurrencyForPDF(tax.taxableAmount, currency)}
                    </Text>
                    <Text style={pdfStyles.taxBreakdownValue}>
                      {formatCurrencyForPDF(tax.taxAmount, currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={pdfStyles.totalValue}>
              {formatCurrencyForPDF(totalTax, currency)}
            </Text>
          </View>
        )}

        {/* Total Tax (if no breakdown) */}
        {!showTaxBreakdown && (
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Tax:</Text>
            <Text style={pdfStyles.totalValue}>
              {formatCurrencyForPDF(totalTax, currency)}
            </Text>
          </View>
        )}

        {/* Grand Total */}
        <View style={pdfStyles.totalRowFinal}>
          <Text style={pdfStyles.totalLabelBold}>TOTAL:</Text>
          <Text style={pdfStyles.totalValueBold}>
            {formatCurrencyForPDF(total, currency)}
          </Text>
        </View>

        {/* Amount Paid (for invoices) */}
        {amountPaid !== undefined && (
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalLabel, pdfStyles.paymentPaid]}>
              Amount Paid:
            </Text>
            <Text style={[pdfStyles.totalValue, pdfStyles.paymentPaid]}>
              {formatCurrencyForPDF(amountPaid, currency)}
            </Text>
          </View>
        )}

        {/* Amount Due (for invoices) */}
        {amountDue !== undefined && (
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.totalLabelBold, pdfStyles.paymentDue]}>
              Amount Due:
            </Text>
            <Text style={[pdfStyles.totalValueBold, pdfStyles.paymentDue]}>
              {formatCurrencyForPDF(amountDue, currency)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
