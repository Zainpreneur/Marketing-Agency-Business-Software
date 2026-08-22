import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@northstar.agency" },
    update: {},
    create: {
      name: "Alex Rivera",
      email: "admin@northstar.agency",
      passwordHash,
      role: "ADMIN",
      title: "Founder & CEO",
      avatarColor: "#4f46e5",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@northstar.agency" },
    update: {},
    create: {
      name: "Sam Chen",
      email: "manager@northstar.agency",
      passwordHash,
      role: "MANAGER",
      title: "Account Director",
      avatarColor: "#059669",
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@northstar.agency" },
    update: {},
    create: {
      name: "Priya Patel",
      email: "employee@northstar.agency",
      passwordHash,
      role: "EMPLOYEE",
      title: "Content Strategist",
      avatarColor: "#d97706",
    },
  });

  const clientDefs = [
    {
      name: "Morgan Blake",
      company: "Everline Apparel",
      email: "morgan@everline.com",
      industry: "E-commerce / Fashion",
      website: "https://everline.example.com",
      status: "ACTIVE" as const,
      logoColor: "#0ea5e9",
      owner: manager.id,
    },
    {
      name: "Dana Kessler",
      company: "Brightleaf Wellness",
      email: "dana@brightleaf.com",
      industry: "Health & Wellness",
      website: "https://brightleaf.example.com",
      status: "ACTIVE" as const,
      logoColor: "#059669",
      owner: admin.id,
    },
    {
      name: "Theo Marsh",
      company: "Ridgeline Outdoors",
      email: "theo@ridgeline.com",
      industry: "Outdoor Retail",
      website: "https://ridgeline.example.com",
      status: "PAUSED" as const,
      logoColor: "#d97706",
      owner: manager.id,
    },
    {
      name: "Nora Vance",
      company: "Cobalt Finance",
      email: "nora@cobaltfinance.com",
      industry: "FinTech",
      website: "https://cobaltfinance.example.com",
      status: "LEAD" as const,
      logoColor: "#7c3aed",
      owner: admin.id,
    },
  ];

  const clients = [];
  for (const c of clientDefs) {
    const client = await prisma.client.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        company: c.company,
        email: c.email,
        industry: c.industry,
        website: c.website,
        status: c.status,
        logoColor: c.logoColor,
        ownerId: c.owner,
        phone: "(555) 010-0100",
        address: "1 Market Street, San Francisco, CA",
      },
    });
    clients.push(client);
  }

  const [everline, brightleaf, ridgeline, cobalt] = clients;

  const campaignDefs = [
    {
      name: "Spring Collection Launch",
      clientId: everline.id,
      channel: "SOCIAL_MEDIA" as const,
      status: "ACTIVE" as const,
      budget: 25000,
      spent: 14200,
      managerId: manager.id,
    },
    {
      name: "Always-On Search Ads",
      clientId: everline.id,
      channel: "PPC" as const,
      status: "ACTIVE" as const,
      budget: 18000,
      spent: 9800,
      managerId: manager.id,
    },
    {
      name: "SEO Content Refresh",
      clientId: brightleaf.id,
      channel: "SEO" as const,
      status: "ACTIVE" as const,
      budget: 12000,
      spent: 6000,
      managerId: admin.id,
    },
    {
      name: "Newsletter Revamp",
      clientId: brightleaf.id,
      channel: "EMAIL" as const,
      status: "PLANNING" as const,
      budget: 6000,
      spent: 0,
      managerId: employee.id,
    },
    {
      name: "Trailhead Brand Refresh",
      clientId: ridgeline.id,
      channel: "BRANDING" as const,
      status: "PAUSED" as const,
      budget: 20000,
      spent: 15500,
      managerId: manager.id,
    },
    {
      name: "Discovery & Strategy Sprint",
      clientId: cobalt.id,
      channel: "OTHER" as const,
      status: "PLANNING" as const,
      budget: 8000,
      spent: 0,
      managerId: admin.id,
    },
  ];

  const campaigns = [];
  for (const camp of campaignDefs) {
    const existing = await prisma.campaign.findFirst({ where: { name: camp.name, clientId: camp.clientId } });
    const campaign =
      existing ??
      (await prisma.campaign.create({
        data: {
          ...camp,
          description: `${camp.name} — planned deliverables, creative, and reporting cadence.`,
          startDate: new Date(Date.now() - 20 * 86400000),
          endDate: new Date(Date.now() + 40 * 86400000),
        },
      }));
    campaigns.push(campaign);
  }

  const taskDefs = [
    { title: "Design hero creative set", campaign: campaigns[0], assignee: employee.id, status: "IN_PROGRESS" as const, priority: "HIGH" as const, days: 3 },
    { title: "Schedule 2-week social calendar", campaign: campaigns[0], assignee: employee.id, status: "TODO" as const, priority: "MEDIUM" as const, days: 6 },
    { title: "Optimize underperforming ad groups", campaign: campaigns[1], assignee: manager.id, status: "IN_REVIEW" as const, priority: "HIGH" as const, days: 2 },
    { title: "Keyword gap analysis", campaign: campaigns[2], assignee: employee.id, status: "DONE" as const, priority: "MEDIUM" as const, days: -4 },
    { title: "Publish 3 pillar articles", campaign: campaigns[2], assignee: employee.id, status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, days: 10 },
    { title: "Draft welcome email sequence", campaign: campaigns[3], assignee: employee.id, status: "TODO" as const, priority: "LOW" as const, days: 14 },
    { title: "Logo exploration round 2", campaign: campaigns[4], assignee: manager.id, status: "TODO" as const, priority: "URGENT" as const, days: 1 },
    { title: "Kickoff call prep", campaign: campaigns[5], assignee: admin.id, status: "TODO" as const, priority: "HIGH" as const, days: 4 },
  ];

  for (const t of taskDefs) {
    const existing = await prisma.task.findFirst({ where: { title: t.title, campaignId: t.campaign.id } });
    if (!existing) {
      await prisma.task.create({
        data: {
          title: t.title,
          campaignId: t.campaign.id,
          assigneeId: t.assignee,
          status: t.status,
          priority: t.priority,
          dueDate: new Date(Date.now() + t.days * 86400000),
        },
      });
    }
  }

  const invoiceDefs = [
    { client: everline, campaign: campaigns[0], status: "PAID" as const, monthsAgo: 2, items: [{ description: "Social media management — March", quantity: 1, rate: 6500 }] },
    { client: everline, campaign: campaigns[1], status: "SENT" as const, monthsAgo: 1, items: [{ description: "Paid search management — April", quantity: 1, rate: 4200 }, { description: "Ad spend management fee", quantity: 1, rate: 800 }] },
    { client: brightleaf, campaign: campaigns[2], status: "PAID" as const, monthsAgo: 1, items: [{ description: "SEO content — April", quantity: 4, rate: 950 }] },
    { client: ridgeline, campaign: campaigns[4], status: "OVERDUE" as const, monthsAgo: 2, items: [{ description: "Brand identity — Phase 1", quantity: 1, rate: 12000 }] },
    { client: brightleaf, campaign: null, status: "DRAFT" as const, monthsAgo: 0, items: [{ description: "Newsletter design & build", quantity: 1, rate: 3200 }] },
  ];

  let i = 0;
  for (const inv of invoiceDefs) {
    i += 1;
    const number = `INV-${String(i).padStart(4, "0")}`;
    const existing = await prisma.invoice.findUnique({ where: { number } });
    if (!existing) {
      const issueDate = new Date();
      issueDate.setMonth(issueDate.getMonth() - inv.monthsAgo);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 14);

      await prisma.invoice.create({
        data: {
          number,
          clientId: inv.client.id,
          campaignId: inv.campaign?.id,
          status: inv.status,
          issueDate,
          dueDate,
          tax: 8.5,
          items: { create: inv.items },
        },
      });
    }
  }

  const activityDefs = [
    { message: `${manager.name} moved Everline Apparel to Active.`, clientId: everline.id, userId: manager.id },
    { message: `${admin.name} created the Discovery & Strategy Sprint campaign.`, clientId: cobalt.id, userId: admin.id, campaignId: campaigns[5].id },
    { message: `${employee.name} published 2 blog posts for Brightleaf Wellness.`, clientId: brightleaf.id, userId: employee.id },
  ];
  for (const a of activityDefs) {
    const existing = await prisma.activity.findFirst({ where: { message: a.message } });
    if (!existing) await prisma.activity.create({ data: a });
  }

  console.log("Seed complete.");
  console.log("Login with: admin@northstar.agency / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
