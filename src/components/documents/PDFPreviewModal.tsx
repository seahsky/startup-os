'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
// Using NPM-managed public folder approach (see implementation notes below)
// Worker file copied automatically by postinstall script from node_modules
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/*
 * IMPLEMENTATION NOTES:
 *
 * NPM-Based Worker Management (Current Approach)
 *
 * This project uses a true npm-based solution for the PDF.js worker:
 * - Worker file auto-copied from node_modules to public/ on npm install
 * - Postinstall script: scripts/copy-pdf-worker.js
 * - Worker version always matches pdfjs-dist package version
 * - No external CDN dependencies required
 *
 * BENEFITS:
 * ✅ Fully self-hosted - no external dependencies
 * ✅ Works offline - no internet required after initial load
 * ✅ Auto-synced - worker version always matches pdfjs-dist
 * ✅ Fast builds - works with Next.js 14 swcMinify: true
 * ✅ Enterprise-ready - no CDN, suitable for airgap deployments
 * ✅ Version control friendly - worker regenerated on npm install
 *
 * HOW IT WORKS:
 * 1. npm install triggers postinstall hook
 * 2. scripts/copy-pdf-worker.js runs automatically
 * 3. Copies node_modules/pdfjs-dist/build/pdf.worker.min.mjs to public/
 * 4. Next.js serves public/pdf.worker.min.mjs as static file
 * 5. react-pdf loads worker from /pdf.worker.min.mjs
 *
 * MAINTENANCE:
 * - Worker updates automatically when pdfjs-dist is updated
 * - No manual version management required
 * - Worker can be gitignored (regenerated on install)
 *
 * ALTERNATIVE APPROACHES EVALUATED:
 *
 * 1. ❌ CDN Approach (unpkg.com)
 *    Pros: Simple, zero configuration
 *    Cons: External dependency, requires internet
 *    Not chosen: Enterprise deployments need offline support
 *
 * 2. ❌ Official new URL() Approach
 *    Requires: swcMinify: false in next.config.js
 *    Pros: Bundled automatically
 *    Cons: Significantly slower builds, larger bundles
 *    Not chosen: Performance tradeoff too significant
 *
 * 3. ❌ Webpack Plugin Approach
 *    Requires: copy-webpack-plugin dependency
 *    Pros: Integrated with build
 *    Cons: Additional dependency, more complex webpack config
 *    Not chosen: Postinstall script is simpler
 *
 * Current choice: NPM script + public folder balances automation,
 * performance, and enterprise requirements with minimal complexity.
 */

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

  // Manage body class to hide mobile menu when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('pdf-modal-open');
    } else {
      document.body.classList.remove('pdf-modal-open');
    }

    return () => {
      document.body.classList.remove('pdf-modal-open');
    };
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-2 sm:p-4">
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

        {/* PDF Viewer - Scrollable All Pages */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4"
        >
          {pdfUrl && containerWidth > 0 && (
            <div className="flex flex-col items-center gap-4">
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
                {Array.from({ length: numPages }, (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={containerWidth}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg max-w-full mb-4"
                  />
                ))}
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
