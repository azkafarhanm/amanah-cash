import { ContentWrapper, SectionHeader } from "@/components/ui";
import { OperatorForm } from "@/components/admin-forms/operator-form";
import { createOperatorAction } from "../actions";
import styles from "../operators.module.css";

export default function NewOperatorPage() {
  return <ContentWrapper>
    <SectionHeader title="Tambah Operator" description="Akun dibuat tidak aktif. Aktifkan setelah akun Google siap digunakan." />
    <OperatorForm
      action={createOperatorAction}
      initialValues={{ name: "", email: "", isActive: false }}
      mode="create"
      styles={styles}
    />
  </ContentWrapper>;
}
