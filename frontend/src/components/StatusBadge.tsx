import { Badge } from "react-bootstrap";
import type { AssignmentStatus, SubmissionStatus } from "@/types/dtos";

const ASSIGNMENT_VARIANTS: Record<AssignmentStatus, string> = {
  Draft: "secondary",
  Published: "success",
};

const SUBMISSION_VARIANTS: Record<SubmissionStatus, string> = {
  Submitted: "primary",
  Late: "warning",
  UnderReview: "info",
  Graded: "success",
  Resubmitted: "primary",
  Rejected: "danger",
};

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  return <Badge bg={ASSIGNMENT_VARIANTS[status] ?? "secondary"}>{status}</Badge>;
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge bg={SUBMISSION_VARIANTS[status] ?? "secondary"} text={status === "Late" ? "dark" : undefined}>
      {status}
    </Badge>
  );
}
