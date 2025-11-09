import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../components/PDFStyles';
import { PDFHeader } from '../components/PDFHeader';
import { PDFFooter } from '../components/PDFFooter';
import { PDFCustomerInfo } from '../components/PDFCustomerInfo';
import { PDFItemsTable } from '../components/PDFItemsTable';
import { formatDateForPDF, formatCurrencyForPDF } from '../utils/pdfHelpers';
import type { Invoice, Company } from '@/lib/types/document';

interface InvoicePDFProps {
  invoice: Invoice;
  company: Company;
}

export function InvoicePDF({ invoice, company }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <PDFHeader
          company={company}
          documentType="INVOICE"
          documentNumber={invoice.documentNumber}
          date={invoice.date}
        />

        {/* Customer Information */}
        <PDFCustomerInfo customer={invoice.customerSnapshot} />

        {/* Invoice Details */}
        <View style={pdfStyles.infoGrid}>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Invoice Date</Text>
            <Text style={pdfStyles.infoBold}>
              {formatDateForPDF(invoice.date)}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Due Date</Text>
            <Text style={pdfStyles.infoBold}>
              {formatDateForPDF(invoice.dueDate)}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Status</Text>
            <Text style={pdfStyles.infoBold}>
              {invoice.status.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Payment Status</Text>
            <Text style={pdfStyles.infoBold}>
              {invoice.paymentStatus.amountDue === 0 ? 'PAID' : 'DUE'}
            </Text>
          </View>
        </View>

        {/* Items Table with Totals */}
        <PDFItemsTable
          items={invoice.items}
          subtotal={invoice.subtotal}
          totalTax={invoice.totalTax}
          total={invoice.total}
          currency={invoice.currency}
          showTaxBreakdown={true}
          amountPaid={invoice.paymentStatus.amountPaid}
          amountDue={invoice.paymentStatus.amountDue}
        />

        {/* Payment History */}
        {invoice.paymentStatus.payments.length > 0 && (
          <View style={pdfStyles.notesSection}>
            <Text style={pdfStyles.sectionTitle}>Payment History</Text>
            {invoice.paymentStatus.payments.map((payment, index) => (
              <View key={index} style={[pdfStyles.totalRow, pdfStyles.mb8]}>
                <View>
                  <Text style={pdfStyles.totalLabel}>
                    {formatDateForPDF(payment.date)} - {payment.method}
                  </Text>
                  {payment.reference && (
                    <Text style={pdfStyles.textSmall}>
                      Ref: {payment.reference}
                    </Text>
                  )}
                </View>
                <Text style={pdfStyles.totalValue}>
                  {formatCurrencyForPDF(payment.amount, invoice.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer with Notes and Terms */}
        <PDFFooter
          notes={invoice.notes}
          termsAndConditions={invoice.termsAndConditions}
          pageNumber={1}
          totalPages={1}
        />
      </Page>
    </Document>
  );
}
