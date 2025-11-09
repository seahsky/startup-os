'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  filename: string;
  onDownload: () => void;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  pdfBlob,
  filename,
  onDownload,
}: PDFPreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBlob]);

  useEffect(() => {
    if (!isOpen) {
      setPageNumber(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-6xl max-h-screen bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{filename}</h2>
          <div className="flex gap-2">
            <Button onClick={onDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          {pdfUrl && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="text-gray-600">Loading PDF...</div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8">
                  <div className="text-red-600">Failed to load PDF</div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          )}
        </div>

        {/* Footer with Pagination */}
        {numPages > 0 && (
          <div className="flex items-center justify-center gap-4 px-6 py-4 border-t bg-white">
            <Button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-700">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
