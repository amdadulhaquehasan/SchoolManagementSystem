import RoleGuard from "@/components/RoleGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["Student"]}>
      <div className="container-lg px-3 px-md-4">{children}</div>
    </RoleGuard>
  );
}
