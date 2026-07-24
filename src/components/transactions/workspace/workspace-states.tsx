import { EmptyState, LoadingSkeleton } from "@/components/ui";

export function WorkspaceEmptyState() {
  return (
    <EmptyState
      title="Belum Ada Transaksi"
      description="Belum ada transaksi yang dicatat untuk siswa yang Anda kelola."
    />
  );
}

export function WorkspaceSkeleton() {
  return <LoadingSkeleton lines={5} variant="table" />;
}

