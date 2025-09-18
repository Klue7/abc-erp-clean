"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth";

function canManageEmployees(role?: string | null) {
  if (!role) return true;
  return ["ADMIN", "MANAGER", "HR", "STAFF"].includes(role.toUpperCase());
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
    const email = (formData.get("email") ?? "").toString().trim() || null;
    const role = (formData.get("role") ?? "").toString().trim() || null;
    const isActive = (formData.get("isActive") ?? "on") === "on";

    if (!name) return { ok: false, reason: "invalid_input" as const };

    await prisma.employee.create({
      data: { name, email, role, isActive },
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
