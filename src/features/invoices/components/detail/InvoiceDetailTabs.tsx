"use client";

import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  DetailPageMainSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";

type InvoiceDetailTabsProps = {
  invoice: Invoice;
};

export function InvoiceDetailTabs({ invoice }: InvoiceDetailTabsProps) {
  const lines = invoice.lines ?? [];

  return (
    <DetailPageTabsSection>
      <DetailPageMainSection>
        <section className="rounded-xl border border-brand-border bg-white">
          <div className="border-b border-brand-border px-4 py-3">
            <h3 className="text-sm font-semibold text-brand-navy">Line items</h3>
            <p className="mt-0.5 text-xs text-brand-muted">
              Products and services billed on this invoice.
            </p>
          </div>
          {lines.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-brand-muted">
              No line items on this invoice.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-brand-border bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">Unit price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3 text-sm text-brand-navy">
                        <p className="font-medium">{line.name}</p>
                        <p className="text-xs text-brand-muted">{line.product_name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-slate">{line.quantity}</td>
                      <td className="px-4 py-3 text-sm text-brand-slate">
                        {formatInvoiceAmount(line.price_unit)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-brand-navy">
                        {formatInvoiceAmount(line.price_subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
