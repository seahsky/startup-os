'use client';

import { usePathname } from 'next/navigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile (< lg breakpoint) */}
      <div className="hidden lg:block">
        <DesktopSidebar pathname={pathname} />
      </div>

      {/* Mobile Header - hidden on desktop (>= lg breakpoint) */}
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      {/* Main Content - responsive padding */}
      <div className="lg:pl-64 pb-20 lg:pb-0">
        <main className="py-4 px-4 lg:py-8 lg:px-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation - hidden on desktop (>= lg breakpoint) */}
      <div className="lg:hidden">
        <MobileBottomNav pathname={pathname} />
      </div>
    </div>
  );
}
