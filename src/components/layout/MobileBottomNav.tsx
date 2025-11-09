'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mobileBottomNavItems } from './NavigationConfig';
import { MobileDocumentMenu } from './MobileDocumentMenu';

interface MobileBottomNavProps {
  pathname: string;
}

export function MobileBottomNav({ pathname }: MobileBottomNavProps) {
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);

  const handleNavClick = (itemId: string, href: string) => {
    if (itemId === 'add') {
      setShowDocumentMenu(true);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe [body.pdf-modal-open_&]:hidden">
        <div className="flex items-end justify-around h-16 px-2">
          {mobileBottomNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const isAddButton = item.id === 'add';

            if (isAddButton) {
              // Center "Add" button - raised FAB style
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.href)}
                  className="relative flex flex-col items-center justify-center"
                  aria-label={item.name}
                >
                  <div className="absolute -top-6 flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="mt-6 text-[10px] font-medium text-gray-600">
                    {item.name}
                  </span>
                </button>
              );
            }

            // Regular navigation buttons
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center min-w-[64px] h-16 transition-colors"
                aria-label={item.name}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`mt-1 text-[10px] font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Document Menu Modal */}
      <MobileDocumentMenu
        isOpen={showDocumentMenu}
        onClose={() => setShowDocumentMenu(false)}
      />
    </>
  );
}
