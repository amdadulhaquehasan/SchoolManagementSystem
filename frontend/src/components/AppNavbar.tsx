"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useAuth } from "@/context/AuthContext";
import GraduationCapIcon from "@/components/icons/GraduationCapIcon";

const ADMIN_LINKS = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/classes", label: "Classes & Courses" },
  { href: "/admin/subjects", label: "Subjects" },
];

const TEACHER_LINKS = [{ href: "/teacher", label: "My Assignments" }];

const STUDENT_LINKS = [
  { href: "/student", label: "Assignments" },
  { href: "/student/submissions", label: "My Grades" },
];

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links =
    user.role === "Admin" ? ADMIN_LINKS : user.role === "Teacher" ? TEACHER_LINKS : STUDENT_LINKS;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="mb-4 shadow-sm">
      <Container fluid="lg">
        <Navbar.Brand as={Link} href={links[0]?.href ?? "/"} className="d-flex align-items-center gap-2">
          <GraduationCapIcon size={26} />
          School Management
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {links.map((link) => (
              <Nav.Link
                key={link.href}
                as={Link}
                href={link.href}
                active={pathname === link.href}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
          <Nav>
            <NavDropdown
              align="end"
              title={`${user.fullName} (${user.role})`}
              id="user-menu"
            >
              <NavDropdown.ItemText className="text-muted small">{user.email}</NavDropdown.ItemText>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>Log out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
