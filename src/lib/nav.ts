import {
  LayoutDashboard,
  Users,
  Megaphone,
  ListChecks,
  Receipt,
  UsersRound,
} from "lucide-react";

export const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/team", label: "Team", icon: UsersRound },
];
