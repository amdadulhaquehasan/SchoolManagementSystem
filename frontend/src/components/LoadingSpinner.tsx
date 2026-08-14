import { Spinner } from "react-bootstrap";

export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <Spinner animation="border" role="status" className="mb-2" />
      <span>{label}</span>
    </div>
  );
}
