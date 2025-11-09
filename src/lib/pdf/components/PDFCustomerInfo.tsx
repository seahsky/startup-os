import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';
import type { CustomerSnapshot } from '@/lib/types/document';

interface PDFCustomerInfoProps {
  customer: CustomerSnapshot;
}

export function PDFCustomerInfo({ customer }: PDFCustomerInfoProps) {
  return (
    <View style={pdfStyles.addressBlock}>
      <Text style={pdfStyles.addressTitle}>Bill To:</Text>
      <View style={pdfStyles.addressText}>
        <Text style={[pdfStyles.textBold, pdfStyles.mb8]}>{customer.name}</Text>
        <Text>{customer.address.street}</Text>
        <Text>
          {customer.address.city}, {customer.address.state}{' '}
          {customer.address.zipCode}
        </Text>
        <Text>{customer.address.country}</Text>
        <Text style={pdfStyles.mt8}>Email: {customer.email}</Text>
        <Text>Phone: {customer.phone}</Text>
        {customer.taxId && <Text>Tax ID: {customer.taxId}</Text>}
      </View>
    </View>
  );
}
