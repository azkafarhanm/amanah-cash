"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authorizeServerAction } from "@/authorization/actions";
import { operatorManagement } from "@/operators/service";
import { OperatorManagementError } from "@/operators/domain";

function message(error: unknown) {
  return error instanceof OperatorManagementError ? error.message : "Permintaan tidak dapat diproses.";
}

export async function createOperatorAction(formData: FormData) {
  const actor = await authorizeServerAction({ role: "admin" });
  try {
    const operator = await operatorManagement().create({ name: formData.get("name"), email: formData.get("email") }, actor.id);
    revalidatePath("/admin/operators");
    redirect(`/admin/operators/${operator.id}?notice=${encodeURIComponent("Operator berhasil dibuat dalam status tidak aktif.")}`);
  } catch (error) {
    if (!(error instanceof OperatorManagementError)) throw error;
    redirect(`/admin/operators/new?error=${encodeURIComponent(message(error))}`);
  }
}

export async function editOperatorAction(id: string, formData: FormData) {
  const actor = await authorizeServerAction({ role: "admin" });
  try {
    await operatorManagement().edit(id, { name: formData.get("name"), isActive: formData.get("isActive") === "on" }, actor.id);
    revalidatePath("/admin/operators");
    revalidatePath(`/admin/operators/${id}`);
  } catch (error) {
    if (!(error instanceof OperatorManagementError)) throw error;
    redirect(`/admin/operators/${id}?error=${encodeURIComponent(message(error))}`);
  }
  redirect(`/admin/operators/${id}?notice=${encodeURIComponent("Perubahan operator disimpan.")}`);
}

export async function deleteOperatorAction(id: string) {
  const actor = await authorizeServerAction({ role: "admin" });
  try {
    await operatorManagement().remove(id, actor.id);
    revalidatePath("/admin/operators");
  } catch (error) {
    if (!(error instanceof OperatorManagementError)) throw error;
    redirect(`/admin/operators/${id}?error=${encodeURIComponent(message(error))}`);
  }
  redirect(`/admin/operators?notice=${encodeURIComponent("Operator dihapus. Riwayat audit tetap tersimpan.")}`);
}
