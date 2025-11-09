import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFStyles';

interface PDFFooterProps {
  notes?: string;
  termsAndConditions?: string;
  pageNumber?: number;
  totalPages?: number;
}

export function PDFFooter({
  notes,
  termsAndConditions,
  pageNumber,
  totalPages,
}: PDFFooterProps) {
  return (
    <>
      {/* Notes and Terms Section */}
      {(notes || termsAndConditions) && (
        <View style={pdfStyles.notesSection}>
          {notes && (
            <View style={pdfStyles.mb16}>
              <Text style={pdfStyles.notesTitle}>Notes:</Text>
              <Text style={pdfStyles.notesText}>{notes}</Text>
            </View>
          )}
          {termsAndConditions && (
            <View>
              <Text style={pdfStyles.notesTitle}>Terms and Conditions:</Text>
              <Text style={pdfStyles.notesText}>{termsAndConditions}</Text>
            </View>
          )}
        </View>
      )}

      {/* Page Footer */}
      <View style={pdfStyles.footer} fixed>
        <Text style={pdfStyles.footerText}>
          This is a computer-generated document. No signature is required.
        </Text>
        {pageNumber && totalPages && (
          <Text style={pdfStyles.pageNumber}>
            Page {pageNumber} of {totalPages}
          </Text>
        )}
      </View>
    </>
  );
}
