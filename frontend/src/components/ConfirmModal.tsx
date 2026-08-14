"use client";

import { Button, Modal } from "react-bootstrap";

interface ConfirmModalProps {
  show: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  confirmVariant?: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  show,
  title,
  body,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={isBusy}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={isBusy}>
          {isBusy ? "Please wait..." : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
