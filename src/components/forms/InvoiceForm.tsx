"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";
import type { FormState } from "@/lib/actions/invoices";
import { calcInvoiceTotals, formatCurrency } from "@/lib/utils";

type Option = { id: string; name: string };
type Item = { description: string; quantity: number; rate: number };

function toDateInput(d?: Date | string | null) {
  if (!d) return new Date().toISOString().slice(0, 10);
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export default function InvoiceForm({
  action,
  clients,
  campaigns,
  defaultValues,
  submitLabel = "Save invoice",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  clients: Option[];
  campaigns: (Option & { clientId: string })[];
  defaultValues?: {
    clientId?: string;
    campaignId?: string | null;
    status?: string;
    issueDate?: Date | string | null;
    dueDate?: Date | string | null;
    tax?: number;
    notes?: string | null;
    items?: Item[];
  };
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const [clientId, setClientId] = useState(defaultValues?.clientId ?? "");
  const [taxRate, setTaxRate] = useState(defaultValues?.tax ?? 0);
  const [items, setItems] = useState<Item[]>(
    defaultValues?.items?.length ? defaultValues.items : [{ description: "", quantity: 1, rate: 0 }]
  );
  const [defaultIssueDate] = useState(() => toDateInput(defaultValues?.issueDate));
  const [defaultDueDate] = useState(() =>
    toDateInput(defaultValues?.dueDate ?? new Date(Date.now() + 14 * 86400000))
  );

  const { subtotal, tax, total } = calcInvoiceTotals(items, taxRate);
  const availableCampaigns = campaigns.filter((c) => !clientId || c.clientId === clientId);

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  return (
    <form action={formAction} className="card p-6 space-y-5 max-w-3xl">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="clientId">Client</label>
          <select
            className="input"
            id="clientId"
            name="clientId"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="" disabled>Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="campaignId">Campaign (optional)</label>
          <select className="input" id="campaignId" name="campaignId" defaultValue={defaultValues?.campaignId ?? ""}>
            <option value="">None</option>
            {availableCampaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select className="input" id="status" name="status" defaultValue={defaultValues?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="tax">Tax rate (%)</label>
          <input
            className="input"
            id="tax"
            name="tax"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="issueDate">Issue date</label>
          <input className="input" id="issueDate" name="issueDate" type="date" required defaultValue={defaultIssueDate} />
        </div>
        <div>
          <label className="field-label" htmlFor="dueDate">Due date</label>
          <input
            className="input"
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={defaultDueDate}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="field-label mb-0">Line items</label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0 }])}
          >
            <Plus size={14} /> Add item
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                className="input flex-1"
                placeholder="Description"
                value={item.description}
                name="itemDescription"
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
              <input
                className="input w-20"
                type="number"
                min={0}
                step="0.01"
                placeholder="Qty"
                value={item.quantity}
                name="itemQuantity"
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
              />
              <input
                className="input w-28"
                type="number"
                min={0}
                step="0.01"
                placeholder="Rate"
                value={item.rate}
                name="itemRate"
                onChange={(e) => updateItem(i, { rate: Number(e.target.value) })}
              />
              <button
                type="button"
                className="btn btn-secondary px-2"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={items.length === 1}
                aria-label="Remove item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-muted"><span>Tax ({taxRate || 0}%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="notes">Notes</label>
        <textarea className="input" id="notes" name="notes" rows={2} defaultValue={defaultValues?.notes ?? ""} placeholder="Payment terms, thank-you note…" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
