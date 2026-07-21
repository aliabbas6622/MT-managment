import express from "express";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static frontend in production
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// ─── Health ───
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.json({ status: "ok", db: "disconnected" });
  }
});

// ─── Employees ───
app.get("/api/employees", async (_req, res) => {
  const rows = await prisma.employee.findMany({ orderBy: { id: "desc" } });
  res.json(rows);
});

app.get("/api/employees/:id", async (req, res) => {
  const row = await prisma.employee.findUnique({ where: { id: Number(req.params.id) } });
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

app.post("/api/employees", async (req, res) => {
  const maxId = await prisma.employee.findMany({ select: { id: true }, orderBy: { id: "desc" }, take: 1 });
  const nextId = maxId.length > 0 ? maxId[0].id + 1 : 1;
  const row = await prisma.employee.create({ data: { ...req.body, id: nextId } });
  res.json(row);
});

app.put("/api/employees/:id", async (req, res) => {
  const row = await prisma.employee.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(row);
});

app.delete("/api/employees/:id", async (req, res) => {
  await prisma.attendance.deleteMany({ where: { employeeId: Number(req.params.id) } });
  await prisma.leave.deleteMany({ where: { employeeId: Number(req.params.id) } });
  await prisma.employee.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// ─── Attendance ───
app.get("/api/attendance", async (_req, res) => {
  const rows = await prisma.attendance.findMany({ orderBy: { id: "desc" } });
  res.json(rows);
});

app.post("/api/attendance", async (req, res) => {
  const maxId = await prisma.attendance.findMany({ select: { id: true }, orderBy: { id: "desc" }, take: 1 });
  const nextId = maxId.length > 0 ? maxId[0].id + 1 : 1;
  const row = await prisma.attendance.create({ data: { ...req.body, id: nextId } });
  res.json(row);
});

app.put("/api/attendance/:id", async (req, res) => {
  const row = await prisma.attendance.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(row);
});

app.delete("/api/attendance/:id", async (req, res) => {
  await prisma.attendance.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// ─── Leaves ───
app.get("/api/leaves", async (_req, res) => {
  const rows = await prisma.leave.findMany({ orderBy: { id: "desc" } });
  res.json(rows);
});

app.post("/api/leaves", async (req, res) => {
  const maxId = await prisma.leave.findMany({ select: { id: true }, orderBy: { id: "desc" }, take: 1 });
  const nextId = maxId.length > 0 ? maxId[0].id + 1 : 1;
  const row = await prisma.leave.create({ data: { ...req.body, id: nextId } });
  res.json(row);
});

app.put("/api/leaves/:id", async (req, res) => {
  const row = await prisma.leave.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(row);
});

app.delete("/api/leaves/:id", async (req, res) => {
  await prisma.leave.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// ─── Departments ───
app.get("/api/departments", async (_req, res) => {
  const rows = await prisma.department.findMany({ orderBy: { id: "asc" } });
  res.json(rows);
});

app.post("/api/departments", async (req, res) => {
  const maxId = await prisma.department.findMany({ select: { id: true }, orderBy: { id: "desc" }, take: 1 });
  const nextId = maxId.length > 0 ? maxId[0].id + 1 : 1;
  const row = await prisma.department.create({ data: { ...req.body, id: nextId } });
  res.json(row);
});

app.put("/api/departments/:id", async (req, res) => {
  const row = await prisma.department.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(row);
});

app.delete("/api/departments/:id", async (req, res) => {
  await prisma.department.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// ─── Expenses ───
app.get("/api/expenses", async (_req, res) => {
  const rows = await prisma.expense.findMany({ orderBy: { id: "desc" } });
  res.json(rows);
});

app.post("/api/expenses", async (req, res) => {
  const maxId = await prisma.expense.findMany({ select: { id: true }, orderBy: { id: "desc" }, take: 1 });
  const nextId = maxId.length > 0 ? maxId[0].id + 1 : 1;
  const row = await prisma.expense.create({ data: { ...req.body, id: nextId } });
  res.json(row);
});

app.put("/api/expenses/:id", async (req, res) => {
  const row = await prisma.expense.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(row);
});

app.delete("/api/expenses/:id", async (req, res) => {
  await prisma.expense.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// ─── Audit Logs ───
app.get("/api/audit-logs", async (_req, res) => {
  const rows = await prisma.auditLog.findMany({ orderBy: { id: "desc" }, take: 200 });
  res.json(rows);
});

app.post("/api/audit-logs", async (req, res) => {
  const maxId = await prisma.auditLog.findMany({ select: { id: true }, orderBy: { id: "desc" }, take: 1 });
  const nextId = maxId.length > 0 ? maxId[0].id + 1 : 1;
  const row = await prisma.auditLog.create({ data: { ...req.body, id: nextId } });
  res.json(row);
});

// ─── Users ───
app.get("/api/users", async (_req, res) => {
  const rows = await prisma.appUser.findMany({ orderBy: { createdAt: "desc" } });
  res.json(rows.map(({ passwordHash: _, ...rest }) => rest));
});

app.post("/api/users", async (req, res) => {
  const { passwordHash, ...data } = req.body;
  const row = await prisma.appUser.create({ data: { ...data, passwordHash: passwordHash || "" } });
  const { passwordHash: _, ...rest } = row;
  res.json(rest);
});

app.put("/api/users/:id", async (req, res) => {
  const row = await prisma.appUser.update({ where: { id: req.params.id }, data: req.body });
  const { passwordHash: _, ...rest } = row;
  res.json(rest);
});

app.delete("/api/users/:id", async (req, res) => {
  await prisma.appUser.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ─── Settings ───
app.get("/api/settings", async (_req, res) => {
  const rows = await prisma.appSetting.findMany();
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
  }
  res.json(settings);
});

app.put("/api/settings", async (req, res) => {
  const entries = Object.entries(req.body) as [string, unknown][];
  for (const [key, value] of entries) {
    await prisma.appSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }
  res.json({ success: true });
});

// ─── Bulk Sync (push all local data to DB) ───
app.post("/api/sync/push", async (req, res) => {
  const { employees, attendance, leaves, departments, expenses, auditLogs } = req.body;

  if (employees) {
    for (const e of employees) {
      const { id, ...data } = e;
      await prisma.employee.upsert({
        where: { id: Number(id) },
        update: data,
        create: { ...data, id: Number(id) },
      });
    }
  }
  if (attendance) {
    for (const a of attendance) {
      const { id, ...data } = a;
      await prisma.attendance.upsert({
        where: { id: Number(id) },
        update: data,
        create: { ...data, id: Number(id) },
      });
    }
  }
  if (leaves) {
    for (const l of leaves) {
      const { id, ...data } = l;
      await prisma.leave.upsert({
        where: { id: Number(id) },
        update: data,
        create: { ...data, id: Number(id) },
      });
    }
  }
  if (departments) {
    for (const d of departments) {
      const { id, ...data } = d;
      await prisma.department.upsert({
        where: { id: Number(id) },
        update: data,
        create: { ...data, id: Number(id) },
      });
    }
  }
  if (expenses) {
    for (const e of expenses) {
      const { id, ...data } = e;
      await prisma.expense.upsert({
        where: { id: Number(id) },
        update: data,
        create: { ...data, id: Number(id) },
      });
    }
  }
  if (auditLogs) {
    for (const l of auditLogs) {
      const { id, ...data } = l;
      await prisma.auditLog.upsert({
        where: { id: Number(id) },
        update: data,
        create: { ...data, id: Number(id) },
      });
    }
  }

  res.json({ success: true, timestamp: new Date().toISOString() });
});

// ─── Bulk Pull (get all data from DB) ───
app.get("/api/sync/pull", async (_req, res) => {
  const [employees, attendance, leaves, departments, expenses, auditLogs] = await Promise.all([
    prisma.employee.findMany({ orderBy: { id: "asc" } }),
    prisma.attendance.findMany({ orderBy: { id: "asc" } }),
    prisma.leave.findMany({ orderBy: { id: "asc" } }),
    prisma.department.findMany({ orderBy: { id: "asc" } }),
    prisma.expense.findMany({ orderBy: { id: "asc" } }),
    prisma.auditLog.findMany({ orderBy: { id: "asc" } }),
  ]);
  res.json({ employees, attendance, leaves, departments, expenses, auditLogs });
});

// SPA fallback - serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Malir Tonight API running on http://localhost:${PORT}`);
});
