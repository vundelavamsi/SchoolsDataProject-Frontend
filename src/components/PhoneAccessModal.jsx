import { useEffect, useState } from "react";
import { describeAccessState, normalizePhone } from "../lib/access";

function getInlineClass(kind) {
  if (kind === "success") return "inline-success";
  if (kind === "warning") return "inline-warning";
  if (kind === "error") return "inline-error";
  return "inline-info";
}

export function PhoneAccessModal({
  isOpen,
  onClose,
  phone,
  access,
  accessLoading,
  accessError,
  onApplyPhone,
  onClearPhone,
  onAuthenticated,
}) {
  const [phoneInput, setPhoneInput] = useState(phone);
  const [pendingPhone, setPendingPhone] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [awaitingResult, setAwaitingResult] = useState(false);
  const [requestStarted, setRequestStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPhoneInput(phone);
    setPendingPhone("");
    setFeedback(null);
    setAwaitingResult(false);
    setRequestStarted(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!awaitingResult) return;
    if (accessLoading) setRequestStarted(true);
  }, [awaitingResult, accessLoading]);

  useEffect(() => {
    if (!pendingPhone || !awaitingResult || !requestStarted || accessLoading) return;

    setAwaitingResult(false);
    setRequestStarted(false);

    if (access.authenticated) {
      setPendingPhone("");
      setFeedback(null);
      onClose();
      onAuthenticated?.();
      return;
    }

    setPendingPhone("");
    if (accessError) {
      setFeedback({
        kind: "error",
        text: "Access verification is temporarily unavailable. Please continue browsing schools and try again shortly.",
      });
      return;
    }

    setFeedback({
      kind: "warning",
      text: "This phone number does not have access yet. Contact your administrator or continue browsing schools.",
    });
    onClearPhone();
  }, [
    pendingPhone,
    awaitingResult,
    requestStarted,
    accessLoading,
    access.authenticated,
    accessError,
    onClose,
    onAuthenticated,
    onClearPhone,
  ]);

  if (!isOpen) return null;

  const resolvedAccess = describeAccessState({ phone, access, error: accessError });
  const isApplying = !!pendingPhone && accessLoading;

  const handleApply = () => {
    const normalized = normalizePhone(phoneInput);
    if (!normalized) {
      setFeedback({ kind: "error", text: "Enter a valid 10-digit phone number." });
      return;
    }

    setFeedback(null);
    setPendingPhone(normalized);
    setAwaitingResult(true);
    setRequestStarted(false);
    onApplyPhone(normalized);
  };

  const handleClear = () => {
    setPhoneInput("");
    setPendingPhone("");
    setFeedback(null);
    setAwaitingResult(false);
    setRequestStarted(false);
    onClearPhone();
    onClose();
  };

  return (
    <div className="phone-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="phone-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-access-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="phone-modal-header">
          <div>
            <h2 id="phone-access-title" className="phone-modal-title">Phone access</h2>
            <p className="phone-modal-subtitle">Browsing remains available without phone verification.</p>
          </div>
          <button className="phone-modal-close" onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="phoneAccessInput">Enter phone number</label>
          <input
            id="phoneAccessInput"
            className="form-input"
            type="tel"
            inputMode="tel"
            value={phoneInput}
            onChange={(event) => setPhoneInput(event.target.value)}
            placeholder="10-digit mobile number"
            disabled={isApplying}
          />
          <p className="phone-modal-helper">
            Use a registered 10-digit mobile number. This checks permissions only.
          </p>
        </div>

        <div className="phone-modal-actions">
          <button className="btn btn--primary" onClick={handleApply} type="button" disabled={isApplying}>
            {isApplying ? "Applying..." : "Apply"}
          </button>
          <button className="btn btn--outline" onClick={handleClear} type="button" disabled={isApplying}>
            Clear
          </button>
        </div>

        {isApplying && (
          <div className="phone-modal-loading">
            <span className="spinner" aria-hidden="true" />
            <span>Checking access...</span>
          </div>
        )}

        <div className={`${getInlineClass(resolvedAccess.kind)} profile-status`}>
          <div className="sr-only" aria-live="polite">
            {resolvedAccess.headline} {resolvedAccess.detail}
          </div>
          <div className="profile-status-headline">{resolvedAccess.headline}</div>
          <div className="profile-status-detail">{resolvedAccess.detail}</div>
        </div>

        {feedback && (
          <div className={getInlineClass(feedback.kind)} role="alert" aria-live="assertive">
            {feedback.text}
          </div>
        )}

        {(feedback || accessError) && (
          <div className="phone-modal-footer">
            <button className="btn btn--outline btn--sm" onClick={onClose} type="button">
              Continue browsing schools
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
