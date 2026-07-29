"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authorizeServerAction } from "@/authorization/actions";
import { operatorManagement } from "@/operators/service";
import { OperatorManagementError } from "@/operators/domain";
import {
  operatorFormError,
  operatorFormValues,
  type OperatorFormState
} from "@/admin-forms/state";

export async function createOperatorAction(
  _state: OperatorFormState,
  formData: FormData
): Promise<OperatorFormState> {
  const actor = await authorizeServerAction({ role: "admin" });
  const values = operatorFormValues(formData);
  try {
    const operator = await operatorManagement().create(values, actor.id);
    revalidatePath("/admin/operators");
    redirect(`/admin/operators/${operator.id}?notice=${encodeURIComponent("Operator berhasil dibuat dalam status tidak aktif.")}`);
  } catch (error) {
    if (!(error instanceof OperatorManagementError)) throw error;
    return operatorFormError(error, values);
  }
}

export async function editOperatorAction(
  id: string,
  _state: OperatorFormState,
  formData: FormData
): Promise<OperatorFormState> {
  const actor = await authorizeServerAction({ role: "admin" });
  const values = operatorFormValues(formData);
  try {
    await operatorManagement().edit(id, values, actor.id);
    revalidatePath("/admin/operators");
    revalidatePath(`/admin/operators/${id}`);
  } catch (error) {
    if (!(error instanceof OperatorManagementError)) throw error;
    return operatorFormError(error, values);
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
    redirect(`/admin/operators/${id}?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/operators?notice=${encodeURIComponent("Operator dihapus. Riwayat audit tetap tersimpan.")}`);
}
