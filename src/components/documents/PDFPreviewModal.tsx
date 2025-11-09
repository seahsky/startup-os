'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Track container width for responsive PDF scaling
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Get container width and subtract padding (32px total = 16px on each side)
        const width = containerRef.current.offsetWidth - 32;
        setContainerWidth(width);
      }
    };

    // Update width on mount and window resize
    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-2 sm:p-4">
      <div className="relative w-full h-full max-w-6xl max-h-screen bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-900 truncate pr-2">
            {filename}
          </h2>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button onClick={onDownload} variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onDownload} variant="outline" size="sm" className="sm:hidden">
              <Download className="w-4 h-4" />
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-2 sm:p-4"
        >
          {pdfUrl && containerWidth > 0 && (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-4 sm:p-8">
                  <div className="text-sm sm:text-base text-gray-600">Loading PDF...</div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-4 sm:p-8">
                  <div className="text-sm sm:text-base text-red-600">Failed to load PDF</div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={containerWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg max-w-full"
              />
            </Document>
          )}
        </div>

        {/* Footer with Pagination */}
        {numPages > 0 && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 border-t bg-white flex-shrink-0">
            <Button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
