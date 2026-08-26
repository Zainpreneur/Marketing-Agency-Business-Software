"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Compass, LogOut } from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import Avatar from "@/components/Avatar";
import { signOutAction } from "@/lib/actions/auth";

export default function Topbar({
  userName,
  userColor,
  userRole,
}: {
  userName: string;
  userColor: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current = NAV.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)));

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden rounded-lg p-2 text-muted hover:bg-background"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="text-lg font-semibold text-foreground">{current?.label ?? "Northstar"}</h1>
      </div>

      <Link href="/profile" className="flex items-center gap-3 rounded-lg px-2 py-1 -mr-2 hover:bg-background">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
          <p className="text-xs text-muted leading-tight">{userRole}</p>
        </div>
        <Avatar name={userName} color={userColor} />
      </Link>

      {open && (
        <div className="absolute inset-x-0 top-16 z-30 border-b border-border bg-surface p-3 md:hidden shadow-lg">
          <div className="flex items-center gap-2 px-2 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
              <Compass size={16} />
            </div>
            <span className="font-semibold text-foreground">Northstar</span>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    active ? "bg-brand-light text-brand" : "text-muted hover:bg-background"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-background"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
