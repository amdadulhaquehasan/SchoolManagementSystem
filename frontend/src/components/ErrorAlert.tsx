import { Alert } from "react-bootstrap";

export default function ErrorAlert({
  message,
  onDismiss,
}: {
  message?: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <Alert variant="danger" dismissible={!!onDismiss} onClose={onDismiss} className="mb-3">
      {message}
    </Alert>
  );
}
