'use client';

import { documentTabs } from '@/components/layout/NavigationConfig';

interface DocumentTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function DocumentTabs({ activeTab, onTabChange }: DocumentTabsProps) {
  return (
    <div className="sticky top-14 z-30 bg-white border-b border-gray-200">
      <div className="flex overflow-x-auto scrollbar-hide">
        {documentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium
                border-b-2 transition-colors whitespace-nowrap
                ${
                  isActive
                    ? `border-blue-600 ${tab.color}`
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
