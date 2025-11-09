'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { documentTypes } from './NavigationConfig';

interface MobileDocumentMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDocumentMenu({ isOpen, onClose }: MobileDocumentMenuProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto pb-safe">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Document</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Document Type List */}
          <div className="p-6 space-y-3">
            {documentTypes.map((docType) => {
              const Icon = docType.icon;
              return (
                <Link
                  key={docType.id}
                  href={docType.href}
                  onClick={onClose}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-white ${docType.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {docType.name}
                    </h3>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom padding for safe area */}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
}
