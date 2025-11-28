import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../components/PDFStyles';
import { PDFHeader } from '../components/PDFHeader';
import { PDFFooter } from '../components/PDFFooter';
import { PDFCustomerInfo } from '../components/PDFCustomerInfo';
import { PDFItemsTable } from '../components/PDFItemsTable';
import { formatDateForPDF, objectIdToString } from '../utils/pdfHelpers';
import type { DebitNote, Company } from '@/lib/types/document';

interface DebitNotePDFProps {
  debitNote: DebitNote;
  company: Company;
}

export function DebitNotePDF({ debitNote, company }: DebitNotePDFProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <PDFHeader
          company={company}
          documentType="DEBIT NOTE"
          documentNumber={debitNote.documentNumber}
          date={debitNote.date}
        />

        {/* Customer Information */}
        <PDFCustomerInfo customer={debitNote.customerSnapshot} />

        {/* Debit Note Details */}
        <View style={pdfStyles.infoGrid}>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Debit Note Date</Text>
            <Text style={pdfStyles.infoBold}>
              {formatDateForPDF(debitNote.date)}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Status</Text>
            <Text style={pdfStyles.infoBold}>
              {debitNote.status.toUpperCase()}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Related Invoice</Text>
            <Text style={pdfStyles.infoValue}>
              {objectIdToString(debitNote.invoiceId)}
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={[pdfStyles.addressBlock, pdfStyles.mb16]}>
          <Text style={pdfStyles.addressTitle}>Reason for Debit Note:</Text>
          <Text style={pdfStyles.addressText}>{debitNote.reason}</Text>
        </View>

        {/* Items Table with Totals */}
        <PDFItemsTable
          items={debitNote.items}
          subtotal={debitNote.subtotal}
          totalTax={debitNote.totalTax}
          total={debitNote.total}
          currency={debitNote.currency}
          showTaxBreakdown={true}
        />

        {/* Footer with Notes and Payment Info */}
        <PDFFooter
          notes={debitNote.notes}
          paymentInfo={company.paymentInfo}
          pageNumber={1}
          totalPages={1}
        />
      </Page>
    </Document>
  );
}
