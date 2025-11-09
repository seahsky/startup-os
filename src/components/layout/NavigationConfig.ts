import {
  LayoutDashboard,
  FileText,
  FileCheck,
  FileX,
  FilePlus,
  Users,
  Package,
  Settings,
  Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Desktop sidebar navigation items
 * Includes all available routes in the application
 */
export const desktopNavItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'quotations', name: 'Quotations', href: '/dashboard/quotations', icon: FileText },
  { id: 'invoices', name: 'Invoices', href: '/dashboard/invoices', icon: FileCheck },
  { id: 'credit-notes', name: 'Credit Notes', href: '/dashboard/credit-notes', icon: FileX },
  { id: 'debit-notes', name: 'Debit Notes', href: '/dashboard/debit-notes', icon: FilePlus },
  { id: 'customers', name: 'Customers', href: '/dashboard/customers', icon: Users },
  { id: 'products', name: 'Products', href: '/dashboard/products', icon: Package },
  { id: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

/**
 * Mobile bottom navigation items
 * Limited to 5 most important items for better mobile UX
 */
export const mobileBottomNavItems: NavItem[] = [
  { id: 'home', name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { id: 'customers', name: 'Customers', href: '/dashboard/customers', icon: Users },
  { id: 'add', name: 'Add', href: '/dashboard/add', icon: Plus },
  { id: 'products', name: 'Products', href: '/dashboard/products', icon: Package },
  { id: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

/**
 * Document types available in the "Add" menu
 */
export interface DocumentType {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export const documentTypes: DocumentType[] = [
  {
    id: 'quotation',
    name: 'New Quotation',
    description: 'Create quote for client',
    href: '/dashboard/quotations/new',
    icon: FileText,
    color: 'text-purple-600',
  },
  {
    id: 'invoice',
    name: 'New Invoice',
    description: 'Bill a customer',
    href: '/dashboard/invoices/new',
    icon: FileCheck,
    color: 'text-blue-600',
  },
  {
    id: 'credit-note',
    name: 'New Credit Note',
    description: 'Issue a credit',
    href: '/dashboard/credit-notes/new',
    icon: FileX,
    color: 'text-red-600',
  },
  {
    id: 'debit-note',
    name: 'New Debit Note',
    description: 'Charge additional fees',
    href: '/dashboard/debit-notes/new',
    icon: FilePlus,
    color: 'text-green-600',
  },
];
