import RoleGuard from "@/components/RoleGuard";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["Teacher"]}>
      <div className="container-lg px-3 px-md-4">{children}</div>
    </RoleGuard>
  );
}
