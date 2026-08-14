"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Nav, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { adminApi } from "@/lib/endpoints/admin";
import { normalizeError } from "@/lib/apiClient";
import type { Role, UserDto } from "@/types/dtos";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import ConfirmModal from "@/components/ConfirmModal";
import CreateTeacherModal from "@/components/admin/CreateTeacherModal";
import CreateStudentModal from "@/components/admin/CreateStudentModal";

type RoleFilter = "All" | Role;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [filter, setFilter] = useState<RoleFilter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserDto | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(
    () => (filter === "All" ? users : users.filter((u) => u.role === filter)),
    [users, filter]
  );

  const toggleActive = async (user: UserDto) => {
    setBusyUserId(user.id);
    try {
      if (user.isActive) {
        await adminApi.deactivate(user.id);
        toast.info(`${user.firstName} ${user.lastName} deactivated.`);
      } else {
        await adminApi.activate(user.id);
        toast.success(`${user.firstName} ${user.lastName} activated.`);
      }
      await loadUsers();
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setBusyUserId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusyUserId(pendingDelete.id);
    try {
      await adminApi.deleteUser(pendingDelete.id);
      toast.success(`${pendingDelete.firstName} ${pendingDelete.lastName} deleted.`);
      setPendingDelete(null);
      await loadUsers();
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">User Management</h1>
          <p className="text-muted mb-0">Create and manage Teacher and Student accounts.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="outline-primary" onClick={() => setShowTeacherModal(true)}>
            + Add Teacher
          </Button>
          <Button variant="primary" onClick={() => setShowStudentModal(true)}>
            + Add Student
          </Button>
        </div>
      </div>

      <Nav variant="pills" className="mb-3 flex-wrap">
        {(["All", "Admin", "Teacher", "Student"] as RoleFilter[]).map((r) => (
          <Nav.Item key={r}>
            <Nav.Link active={filter === r} onClick={() => setFilter(r)} className="cursor-pointer">
              {r}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <ErrorAlert message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <LoadingSpinner label="Loading users..." />
      ) : filteredUsers.length === 0 ? (
        <p className="text-muted">No users found for this filter.</p>
      ) : (
        <div className="table-responsive-wrapper">
          <Table hover responsive className="align-middle bg-white shadow-sm rounded">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge bg={u.role === "Admin" ? "dark" : u.role === "Teacher" ? "info" : "success"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={u.isActive ? "success" : "secondary"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="text-muted small">{new Date(u.createdAtUtc).toLocaleDateString()}</td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      {u.role !== "Admin" && (
                        <>
                          <Button
                            size="sm"
                            variant={u.isActive ? "outline-warning" : "outline-success"}
                            disabled={busyUserId === u.id}
                            onClick={() => toggleActive(u)}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            disabled={busyUserId === u.id}
                            onClick={() => setPendingDelete(u)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <CreateTeacherModal
        show={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        onCreated={() => {
          setShowTeacherModal(false);
          loadUsers();
        }}
      />
      <CreateStudentModal
        show={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onCreated={() => {
          setShowStudentModal(false);
          loadUsers();
        }}
      />
      <ConfirmModal
        show={!!pendingDelete}
        title="Delete user"
        body={
          pendingDelete
            ? `Are you sure you want to permanently delete ${pendingDelete.firstName} ${pendingDelete.lastName}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isBusy={!!busyUserId}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
