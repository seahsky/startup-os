import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../components/PDFStyles';
import { PDFHeader } from '../components/PDFHeader';
import { PDFFooter } from '../components/PDFFooter';
import { PDFCustomerInfo } from '../components/PDFCustomerInfo';
import { PDFItemsTable } from '../components/PDFItemsTable';
import { formatDateForPDF, objectIdToString } from '../utils/pdfHelpers';
import type { CreditNote, Company } from '@/lib/types/document';

interface CreditNotePDFProps {
  creditNote: CreditNote;
  company: Company;
}

export function CreditNotePDF({ creditNote, company }: CreditNotePDFProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <PDFHeader
          company={company}
          documentType="CREDIT NOTE"
          documentNumber={creditNote.documentNumber}
          date={creditNote.date}
        />

        {/* Customer Information */}
        <PDFCustomerInfo customer={creditNote.customerSnapshot} />

        {/* Credit Note Details */}
        <View style={pdfStyles.infoGrid}>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Credit Note Date</Text>
            <Text style={pdfStyles.infoBold}>
              {formatDateForPDF(creditNote.date)}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Status</Text>
            <Text style={pdfStyles.infoBold}>
              {creditNote.status.toUpperCase()}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Related Invoice</Text>
            <Text style={pdfStyles.infoValue}>
              {objectIdToString(creditNote.invoiceId)}
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={[pdfStyles.addressBlock, pdfStyles.mb16]}>
          <Text style={pdfStyles.addressTitle}>Reason for Credit Note:</Text>
          <Text style={pdfStyles.addressText}>{creditNote.reason}</Text>
        </View>

        {/* Items Table with Totals */}
        <PDFItemsTable
          items={creditNote.items}
          subtotal={creditNote.subtotal}
          totalTax={creditNote.totalTax}
          total={creditNote.total}
          currency={creditNote.currency}
          showTaxBreakdown={true}
        />

        {/* Footer with Notes */}
        <PDFFooter
          notes={creditNote.notes}
          pageNumber={1}
          totalPages={1}
        />
      </Page>
    </Document>
  );
}
