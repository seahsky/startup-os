import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../components/PDFStyles';
import { PDFHeader } from '../components/PDFHeader';
import { PDFFooter } from '../components/PDFFooter';
import { PDFCustomerInfo } from '../components/PDFCustomerInfo';
import { PDFItemsTable } from '../components/PDFItemsTable';
import { formatDateForPDF } from '../utils/pdfHelpers';
import type { Quotation, Company } from '@/lib/types/document';

interface QuotationPDFProps {
  quotation: Quotation;
  company: Company;
}

export function QuotationPDF({ quotation, company }: QuotationPDFProps) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <PDFHeader
          company={company}
          documentType="QUOTATION"
          documentNumber={quotation.documentNumber}
          date={quotation.date}
        />

        {/* Customer Information */}
        <PDFCustomerInfo customer={quotation.customerSnapshot} />

        {/* Quotation Details */}
        <View style={pdfStyles.infoGrid}>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Quotation Date</Text>
            <Text style={pdfStyles.infoBold}>
              {formatDateForPDF(quotation.date)}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Valid Until</Text>
            <Text style={pdfStyles.infoBold}>
              {formatDateForPDF(quotation.validUntil)}
            </Text>
          </View>
          <View style={pdfStyles.infoBlock}>
            <Text style={pdfStyles.infoLabel}>Status</Text>
            <Text style={pdfStyles.infoBold}>
              {quotation.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Items Table with Totals */}
        <PDFItemsTable
          items={quotation.items}
          subtotal={quotation.subtotal}
          totalTax={quotation.totalTax}
          total={quotation.total}
          currency={quotation.currency}
          showTaxBreakdown={true}
        />

        {/* Footer with Notes and Terms */}
        <PDFFooter
          notes={quotation.notes}
          termsAndConditions={quotation.termsAndConditions}
          pageNumber={1}
          totalPages={1}
        />
      </Page>
    </Document>
  );
}
