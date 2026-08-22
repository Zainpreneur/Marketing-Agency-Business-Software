"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button type="button" className="btn btn-secondary print:hidden" onClick={() => window.print()}>
      <Printer size={15} /> Print
    </button>
  );
}
