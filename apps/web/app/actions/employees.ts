"use server";

import type { Prisma } from "@prisma/client";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth";

function canManageEmployees(role?: string | null) {
  if (!role) return true;
  return ["ADMIN", "MANAGER", "HR", "STAFF"].includes(role.toUpperCase());
}

const STAFF_ROLES = ["ADMIN", "SALES", "STAFF", "DRIVER", "WAREHOUSE"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

function normaliseRole(input: string | null): StaffRole {
  const upper = input?.trim().toUpperCase() ?? "";
  return (STAFF_ROLES as readonly string[]).includes(upper) ? (upper as StaffRole) : "STAFF";
}

function parseCurrency(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100) / 100;
}

function normaliseEmail(value: FormDataEntryValue | null): string | null {
  if (!value) return null;
  const email = String(value).trim().toLowerCase();
  if (!email || !email.includes("@")) return null;
  return email;
}

async function getNextEmployeeId(tx: Prisma.TransactionClient): Promise<string> {
  const last = await tx.employee.findFirst({
    where: { employeeId: { startsWith: "ABC" } },
    orderBy: { employeeId: "desc" },
    select: { employeeId: true },
  });

  const nextNumber = last ? Number.parseInt(last.employeeId.replace(/^ABC/, ""), 10) + 1 : 1;
  const padded = Number.isFinite(nextNumber) ? String(nextNumber).padStart(3, "0") : "000";
  return "ABC" + padded;
}

export async function createEmployeeAction(formData: FormData) {
  try {
    const user = await getCurrentUserWithRole();
    if (user?.role && !canManageEmployees(user.role)) {
      return { ok: false, reason: "not_authorized" as const };
    }

    // @ts-ignore – defensive: prisma may not have delegate at runtime
    if (!prisma?.employee) {
      return { ok: false, reason: "missing_model" as const };
    }

    const name = (formData.get("name") ?? "").toString().trim();
    if (!name) return { ok: false, reason: "invalid_input" as const };

    const email = normaliseEmail(formData.get("email"));
    const workEmail = normaliseEmail(formData.get("workEmail"));
    const role = normaliseRole((formData.get("role") ?? "").toString());
    const avatarUrl = (formData.get("avatarUrl") ?? "").toString().trim() || null;
    const contactNumber = (formData.get("contactNumber") ?? "").toString().trim() || null;
    const address = (formData.get("address") ?? "").toString().trim() || null;
    const bankName = (formData.get("bankName") ?? "").toString().trim() || null;
    const bankAccountHolder = (formData.get("bankAccountHolder") ?? "").toString().trim() || null;
    const bankAccountNumber = (formData.get("bankAccountNumber") ?? "").toString().trim() || null;
    const basicSalary = parseCurrency(formData.get("basicSalary") ?? null);
    const nationalId = (formData.get("nationalId") ?? "").toString().trim() || null;
    const uploadsInfo = (formData.get("uploadsInfo") ?? "").toString().trim() || null;
    const team = (formData.get("team") ?? "").toString().trim() || null;
    const isActive = (formData.get("isActive") ?? "on") === "on";

    await prisma.$transaction(async (tx) => {
      const employeeId = await getNextEmployeeId(tx);

      await tx.employee.create({
        data: {
          employeeId,
          name,
          email,
          workEmail,
          contactNumber,
          avatarUrl,
          address,
          bankName,
          bankAccountHolder,
          bankAccountNumber,
          basicSalary: basicSalary ?? undefined,
          nationalId,
          uploadsInfo,
          role,
          team,
          isActive,
        },
      });
    });

    revalidatePath("/employees");
    return { ok: true as const };
  } catch (e) {
    console.error("[createEmployeeAction]", e);
    return { ok: false, reason: "server_error" as const };
  }
}

export async function toggleEmployeeActiveAction(id: string) {
  try {
    const user = await getCurrentUserWithRole();
    if (user?.role && !canManageEmployees(user.role)) {
      return { ok: false, reason: "not_authorized" as const };
    }

    // @ts-ignore – defensive
    if (!prisma?.employee) {
      return { ok: false, reason: "missing_model" as const };
    }

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) return { ok: false, reason: "not_found" as const };

    await prisma.employee.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/employees");
    return { ok: true as const };
  } catch (e) {
    console.error("[toggleEmployeeActiveAction]", e);
    return { ok: false, reason: "server_error" as const };
  }
}
