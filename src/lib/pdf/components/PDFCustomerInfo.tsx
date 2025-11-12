import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';
import type { CustomerSnapshot } from '@/lib/types/document';

interface PDFCustomerInfoProps {
  customer: CustomerSnapshot;
}

export function PDFCustomerInfo({ customer }: PDFCustomerInfoProps) {
  // Build city/state/zip line only if at least one field exists
  const cityStateLine = customer.address
    ? [customer.address.city, customer.address.state, customer.address.zipCode]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <View style={pdfStyles.addressBlock}>
      <Text style={pdfStyles.addressTitle}>Bill To:</Text>
      <View style={pdfStyles.addressText}>
        <Text style={[pdfStyles.textBold, pdfStyles.mb8]}>{customer.name}</Text>
        {customer.address?.street && <Text>{customer.address.street}</Text>}
        {cityStateLine && <Text>{cityStateLine}</Text>}
        {customer.address?.country && <Text>{customer.address.country}</Text>}
        <Text style={pdfStyles.mt8}>Email: {customer.email}</Text>
        <Text>Phone: {customer.phone}</Text>
        {customer.taxId && <Text>Tax ID: {customer.taxId}</Text>}
      </View>
    </View>
  );
}
