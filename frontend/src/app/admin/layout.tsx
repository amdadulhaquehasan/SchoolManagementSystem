import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["Admin"]}>
      <div className="container-lg px-3 px-md-4">{children}</div>
    </RoleGuard>
  );
}
