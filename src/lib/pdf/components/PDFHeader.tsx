import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';
import { formatDateForPDF } from '../utils/pdfHelpers';
import type { Company } from '@/lib/types/document';

interface PDFHeaderProps {
  company: Company;
  documentType: 'INVOICE' | 'QUOTATION' | 'CREDIT NOTE' | 'DEBIT NOTE';
  documentNumber: string;
  date: Date;
}

export function PDFHeader({
  company,
  documentType,
  documentNumber,
  date,
}: PDFHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <View style={pdfStyles.headerTop}>
        {/* Company Info */}
        <View style={pdfStyles.companyInfo}>
          {company.logo && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={company.logo}
              style={pdfStyles.logo}
            />
          )}
          <Text style={pdfStyles.companyName}>{company.name}</Text>
          <View style={pdfStyles.companyDetails}>
            <Text>{company.address.street}</Text>
            <Text>
              {company.address.city}, {company.address.state}{' '}
              {company.address.zipCode}
            </Text>
            <Text>{company.address.country}</Text>
            <Text style={pdfStyles.mt8}>Phone: {company.phone}</Text>
            <Text>Email: {company.email}</Text>
            {company.taxId && <Text>Tax ID: {company.taxId}</Text>}
          </View>
        </View>

        {/* Document Title and Number */}
        <View style={{ textAlign: 'right' }}>
          <Text style={pdfStyles.documentTitle}>{documentType}</Text>
          <Text style={pdfStyles.documentNumber}>{documentNumber}</Text>
          <Text style={[pdfStyles.companyDetails, pdfStyles.mt8]}>
            Date: {formatDateForPDF(date)}
          </Text>
        </View>
      </View>
    </View>
  );
}
