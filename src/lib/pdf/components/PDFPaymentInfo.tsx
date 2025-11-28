import { View, Text } from "@react-pdf/renderer";
import { pdfStyles } from "./PDFStyles";
import type { PaymentInfo } from "@/lib/types/document";

interface PDFPaymentInfoProps {
  paymentInfo: PaymentInfo;
}

export function PDFPaymentInfo({ paymentInfo }: PDFPaymentInfoProps) {
  // Format BSB with hyphen for display (123456 -> 123-456)
  const formattedBsb =
    paymentInfo.bsb.length === 6
      ? `${paymentInfo.bsb.slice(0, 3)}-${paymentInfo.bsb.slice(3)}`
      : paymentInfo.bsb;

  return (
    <View style={pdfStyles.paymentInfoSection} wrap={false}>
      <Text style={pdfStyles.paymentInfoTitle}>Payment Details</Text>
      <View style={pdfStyles.paymentInfoGrid}>
        <View style={pdfStyles.paymentInfoRow}>
          <Text style={pdfStyles.paymentInfoLabel}>Bank:</Text>
          <Text style={pdfStyles.paymentInfoValue}>{paymentInfo.bankName}</Text>
        </View>
        <View style={pdfStyles.paymentInfoRow}>
          <Text style={pdfStyles.paymentInfoLabel}>BSB:</Text>
          <Text style={pdfStyles.paymentInfoValue}>{formattedBsb}</Text>
        </View>
        <View style={pdfStyles.paymentInfoRow}>
          <Text style={pdfStyles.paymentInfoLabel}>Account Number:</Text>
          <Text style={pdfStyles.paymentInfoValue}>
            {paymentInfo.accountNumber}
          </Text>
        </View>
        <View style={pdfStyles.paymentInfoRow}>
          <Text style={pdfStyles.paymentInfoLabel}>Name:</Text>
          <Text style={pdfStyles.paymentInfoValue}>
            {paymentInfo.accountName}
          </Text>
        </View>
      </View>
    </View>
  );
}
