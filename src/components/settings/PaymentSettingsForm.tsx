'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { InputField } from '@/components/shared/FormField';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { Building2, Trash2 } from 'lucide-react';
import type { PaymentInfo } from '@/lib/types/document';

interface PaymentSettingsFormProps {
  initialData?: PaymentInfo;
}

export function PaymentSettingsForm({ initialData }: PaymentSettingsFormProps) {
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    bankName: '',
    bsb: '',
    accountNumber: '',
    accountName: '',
  });
  const [hasPaymentInfo, setHasPaymentInfo] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        bankName: initialData.bankName,
        bsb: formatBsb(initialData.bsb),
        accountNumber: initialData.accountNumber,
        accountName: initialData.accountName,
      });
      setHasPaymentInfo(true);
    }
  }, [initialData]);

  const updateMutation = trpc.company.updatePaymentInfo.useMutation({
    onSuccess: () => {
      toast.success('Payment information saved successfully');
      utils.company.get.invalidate();
      setHasPaymentInfo(true);
    },
    onError: (error) => {
      toast.error('Failed to save payment information', {
        description: error.message,
      });
    },
  });

  const clearMutation = trpc.company.clearPaymentInfo.useMutation({
    onSuccess: () => {
      toast.success('Payment information removed');
      utils.company.get.invalidate();
      setFormData({ bankName: '', bsb: '', accountNumber: '', accountName: '' });
      setHasPaymentInfo(false);
    },
    onError: (error) => {
      toast.error('Failed to remove payment information', {
        description: error.message,
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format BSB as user types (XXX-XXX)
    if (name === 'bsb') {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const formatted = digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
      setFormData((prev) => ({ ...prev, bsb: formatted }));
      return;
    }

    // Only allow digits for account number
    if (name === 'accountNumber') {
      const digits = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, accountNumber: digits }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate BSB has 6 digits
    const bsbDigits = formData.bsb.replace(/-/g, '');
    if (bsbDigits.length !== 6) {
      toast.error('BSB must be exactly 6 digits');
      return;
    }

    if (!formData.accountNumber) {
      toast.error('Account number is required');
      return;
    }

    updateMutation.mutate({
      bankName: formData.bankName,
      bsb: bsbDigits,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
    });
  };

  const handleClear = () => {
    if (
      confirm(
        'Are you sure you want to remove payment information? This will remove bank details from all future invoices.'
      )
    ) {
      clearMutation.mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-500" />
          <CardTitle>Bank Account Details</CardTitle>
        </div>
        <CardDescription>
          Add your Australian bank account details to display on invoices and quotations. This helps
          customers pay you directly via bank transfer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Commonwealth Bank"
              required
            />
            <InputField
              label="BSB"
              name="bsb"
              value={formData.bsb}
              onChange={handleChange}
              placeholder="XXX-XXX"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="12345678"
              required
            />
            <InputField
              label="Account Name"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="My Business Pty Ltd"
              required
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            {hasPaymentInfo && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={clearMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Payment Info
              </Button>
            )}
            <div className={hasPaymentInfo ? '' : 'ml-auto'}>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Payment Details'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Helper to format BSB for display (123456 -> 123-456)
function formatBsb(bsb: string): string {
  if (!bsb) return '';
  const digits = bsb.replace(/-/g, '');
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}`;
}
