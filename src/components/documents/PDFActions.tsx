'use client';

import { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFPreviewModal } from './PDFPreviewModal';
import {
  generatePDF,
  downloadPDF,
  getDocumentPDFFilename,
  type DocumentType,
} from '@/lib/pdf/pdfGenerator';
import type { Invoice, Quotation, CreditNote, DebitNote, Company } from '@/lib/types/document';

interface PDFActionsProps {
  documentType: DocumentType;
  document: Invoice | Quotation | CreditNote | DebitNote;
  company: Company;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function PDFActions({
  documentType,
  document,
  company,
  variant = 'outline',
  size = 'default',
}: PDFActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filename = getDocumentPDFFilename(documentType, document.documentNumber);

  const handleGeneratePDF = async (): Promise<Blob | null> => {
    setError(null);
    setIsGenerating(true);

    try {
      const blob = await generatePDF(documentType, document, company);
      return blob;
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleView = async () => {
    const blob = await handleGeneratePDF();
    if (blob) {
      setPdfBlob(blob);
      setIsPreviewOpen(true);
    }
  };

  const handleDownload = async () => {
    const blob = pdfBlob || (await handleGeneratePDF());
    if (blob) {
      downloadPDF(blob, filename);
    }
  };

  const handleDownloadDirect = async () => {
    const blob = await handleGeneratePDF();
    if (blob) {
      downloadPDF(blob, filename);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {/* View PDF Button */}
        <Button
          onClick={handleView}
          disabled={isGenerating}
          variant={variant}
          size={size}
        >
          <Eye className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'View PDF'}
        </Button>

        {/* Download PDF Button */}
        <Button
          onClick={handleDownloadDirect}
          disabled={isGenerating}
          variant={variant}
          size={size}
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 mt-2">
          {error}
        </div>
      )}

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfBlob={pdfBlob}
        filename={filename}
        onDownload={handleDownload}
      />
    </>
  );
}
