import { Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';
import { formatTaxIdsForPDF } from '../utils/pdfHelpers';

interface PDFTaxIdsProps {
  country: string;
  taxIds?: Record<string, string>;
}

/**
 * Displays formatted tax IDs in PDF documents
 *
 * Handles country-specific formatting and multiple tax ID types.
 * Automatically formats tax IDs based on country (e.g., US EIN, AU ABN, GB VAT).
 * Returns null if no tax IDs are provided.
 *
 * @param country - ISO 3166-1 alpha-2 country code (e.g., 'US', 'AU', 'GB')
 * @param taxIds - Object containing tax ID key-value pairs
 *
 * @example
 * <PDFTaxIds country="AU" taxIds={{ abn: '12345678901' }} />
 * // Renders: "ABN: 12 345 678 901"
 *
 * @example
 * <PDFTaxIds country="AU" taxIds={{ abn: '12345678901', acn: '123456789' }} />
 * // Renders:
 * // "ABN: 12 345 678 901"
 * // "ACN: 123 456 789"
 */
export function PDFTaxIds({ country, taxIds }: PDFTaxIdsProps) {
  const formattedTaxIds = formatTaxIdsForPDF(country, taxIds);

  if (formattedTaxIds.length === 0) return null;

  return (
    <>
      {formattedTaxIds.map((taxId, index) => (
        <Text key={index}>
          {taxId.label}: {taxId.value}
        </Text>
      ))}
    </>
  );
}
