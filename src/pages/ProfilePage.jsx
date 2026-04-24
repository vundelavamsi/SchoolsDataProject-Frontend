import { describeAccessState, getAccessScopeLabel } from "../lib/access";

function getInlineClass(kind) {
  if (kind === "success") return "inline-success";
  if (kind === "warning") return "inline-warning";
  if (kind === "error") return "inline-error";
  return "inline-info";
}

export function ProfilePage({
  phone,
  access,
  accessLoading,
  accessError,
  onNavigateReview,
  onLogout,
  onBack,
}) {
  const accessState = describeAccessState({ phone, access, error: accessError });

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Profile</h1>
          <p className="app-subtitle">Account access and permissions</p>
        </div>
        <nav className="header-nav">
          <button className="btn btn--outline btn--sm" onClick={onBack} type="button">
            Browse schools
          </button>
        </nav>
      </header>

      <div className="app-main">
        <div className="page-layout profile-layout">
          <div className="page-card profile-card">
            <div className="profile-header-row">
              <div>
                <h2 className="profile-title">Account profile</h2>
                <p className="profile-subtitle-copy">You are signed in with phone-based role access.</p>
              </div>
              {accessLoading && <span className="badge badge--other">Checking…</span>}
            </div>

            <div className={`${getInlineClass(accessState.kind)} profile-status`}>
              <div className="profile-status-headline">{accessState.headline}</div>
              <div className="profile-status-detail">{accessState.detail}</div>
            </div>

            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span>Phone</span>
                <strong>{phone || "Not set"}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Role</span>
                <strong>{access.authenticated ? access.role : "Browsing only"}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Scope</span>
                <strong>{access.authenticated ? getAccessScopeLabel(access) : "Browsing only"}</strong>
              </div>
            </div>

            <div className="profile-actions">
              {(access.canEdit || access.canReview) && (
                <button className="btn btn--primary" onClick={onNavigateReview} type="button">
                  {access.canReview ? "Review Edits" : "My Edits"}
                </button>
              )}
              <button className="btn btn--danger" onClick={onLogout} type="button">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
