import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "/api/applications";
const PAGE_SIZE = 8;
const STATUSES = [
  ["WISHLIST", "Wishlist"],
  ["APPLIED", "Applied"],
  ["ASSESSMENT", "Assessment"],
  ["INTERVIEW", "Interview"],
  ["OFFER", "Offer"],
  ["REJECTED", "Rejected"],
  ["WITHDRAWN", "Withdrawn"],
];

const emptyForm = () => ({
  company: "",
  jobTitle: "",
  jobType: "",
  location: "",
  status: "APPLIED",
  applicationDate: new Date().toISOString().slice(0, 10),
  interviewDate: "",
  jobUrl: "",
  notes: "",
});

async function api(path = "", options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fieldErrors = data.fields
      ? Object.entries(data.fields).map(([field, message]) => `${field}: ${message}`).join(" · ")
      : "";
    throw new Error(fieldErrors || data.message || data.error || `Request failed (${response.status})`);
  }
  return data;
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function safeJobUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function App() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const dialogRef = useRef(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (dialogOpen && !dialogRef.current.open) dialogRef.current.showModal();
    if (!dialogOpen && dialogRef.current.open) dialogRef.current.close();
  }, [dialogOpen]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ page, size: PAGE_SIZE });
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);

    api(`?${params}`)
      .then((result) => {
        if (!active) return;
        setApplications(result.content || []);
        setTotalPages(result.totalPages || 0);
      })
      .catch((error) => {
        if (active) setNotice({ message: `Could not load applications: ${error.message}`, error: true });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, search, statusFilter]);

  useEffect(() => {
    let active = true;
    api("/stats")
      .then((result) => {
        if (active) setStats(result);
      })
      .catch((error) => {
        if (active) setNotice({ message: `Could not load dashboard stats: ${error.message}`, error: true });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  function showNotice(message, error = false) {
    setNotice({ message, error });
    if (!error) window.setTimeout(() => setNotice(null), 4000);
  }

  async function refreshStats() {
    setStats(await api("/stats"));
  }

  function openNewApplication() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setDialogOpen(true);
  }

  async function editApplication(id) {
    try {
      const application = await api(`/${id}`);
      setEditingId(id);
      setForm({
        company: application.company || "",
        jobTitle: application.jobTitle || "",
        jobType: application.jobType || "",
        location: application.location || "",
        status: application.status || "APPLIED",
        applicationDate: application.applicationDate || "",
        interviewDate: application.interviewDate || "",
        jobUrl: application.jobUrl || "",
        notes: application.notes || "",
      });
      setFormError("");
      setDialogOpen(true);
    } catch (error) {
      showNotice(error.message, true);
    }
  }

  async function deleteApplication(id) {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    try {
      await api(`/${id}`, { method: "DELETE" });
      showNotice("Application deleted.");
      await Promise.all([refreshStats(), reloadCurrentPage()]);
    } catch (error) {
      showNotice(error.message, true);
    }
  }

  async function reloadCurrentPage() {
    const params = new URLSearchParams({ page, size: PAGE_SIZE });
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    const result = await api(`?${params}`);
    const nextPages = result.totalPages || 0;
    if (page > 0 && page >= nextPages) {
      setPage(page - 1);
    } else {
      setApplications(result.content || []);
      setTotalPages(nextPages);
    }
  }

  function updateSearch(value) {
    clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(0);
      setSearch(value);
    }, 250);
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function submitApplication(event) {
    event.preventDefault();
    setFormError("");
    const payload = {
      ...form,
      company: form.company.trim(),
      jobTitle: form.jobTitle.trim(),
      jobType: form.jobType || null,
      location: form.location.trim() || null,
      interviewDate: form.interviewDate || null,
      jobUrl: form.jobUrl.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      await api(editingId ? `/${editingId}` : "", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setDialogOpen(false);
      setPage(0);
      showNotice(editingId ? "Application updated successfully." : "Application added successfully.");
      await Promise.all([refreshStats(), reloadFirstPage()]);
    } catch (error) {
      setFormError(error.message);
    }
  }

  async function reloadFirstPage() {
    const params = new URLSearchParams({ page: 0, size: PAGE_SIZE });
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    const result = await api(`?${params}`);
    setApplications(result.content || []);
    setTotalPages(result.totalPages || 0);
  }

  const statCards = [
    { label: "Total applications", value: stats?.total, note: "All tracked opportunities" },
    { label: "In progress", value: stats ? stats.applied + stats.assessments : null, note: "Submitted and moving forward" },
    { label: "Interviews", value: stats?.interviews, note: "Make every conversation count" },
    { label: "Offers", value: stats?.offers, note: "Your hard work paying off" },
  ];

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/" aria-label="JobTrack home">
          <span className="brand-icon">JT</span>
          <span><strong>JobTrack</strong><small>YOUR CAREER, ORGANIZED</small></span>
        </a>
        <button className="button primary" onClick={openNewApplication}>＋ Add application</button>
      </header>

      <main className="page">
        <section className="intro">
          <div>
            <p className="eyebrow">PLACEMENT COMMAND CENTRE</p>
            <h1>Your next opportunity<br /><span>starts with a plan.</span></h1>
            <p className="subtitle">Keep every application, assessment, and interview in one place.</p>
          </div>
          <span className="intro-mark" aria-hidden="true">↗</span>
        </section>

        <section className="stats-grid" aria-label="Application statistics">
          {statCards.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value ?? "—"}</strong>
              <small>{stat.note}</small>
            </article>
          ))}
        </section>

        <section className="toolbar">
          <div><h2>Applications</h2><p className="muted">A clear view of your job search.</p></div>
          <div className="filters">
            <input
              type="search"
              placeholder="Search company or role…"
              aria-label="Search applications"
              onChange={(event) => updateSearch(event.target.value)}
            />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => {
                setPage(0);
                setStatusFilter(event.target.value);
              }}
            >
              <option value="">All statuses</option>
              {STATUSES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </div>
        </section>

        {notice && (
          <div className={`notice${notice.error ? " error" : ""}`} role={notice.error ? "alert" : "status"}>
            {notice.message}
            <button className="notice-close" aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button>
          </div>
        )}

        <section className="application-list" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="empty"><strong>Loading applications…</strong></div>
          ) : applications.length === 0 ? (
            <div className="empty">
              <span className="empty-icon" aria-hidden="true">✳</span>
              <strong>No applications found</strong>
              <p>Add your first opportunity or change your search filters.</p>
              <button className="button primary" onClick={openNewApplication}>＋ Add application</button>
            </div>
          ) : applications.map((application) => (
            <article className="application-card" key={application.id}>
              <div className="card-main">
                <div className="card-top">
                  <h3>{application.jobTitle}</h3>
                  <span className={`status ${application.status}`}>{labelFor(application.status)}</span>
                </div>
                <div className="company">
                  {application.company}
                  {application.location && <> · {application.location}</>}
                  {application.jobType && <> · {application.jobType}</>}
                </div>
                <div className="meta">
                  <span>Applied: {formatDate(application.applicationDate)}</span>
                  <span>Interview: {formatDate(application.interviewDate)}</span>
                  {safeJobUrl(application.jobUrl) && (
                    <a href={safeJobUrl(application.jobUrl)} target="_blank" rel="noopener noreferrer">View job ↗</a>
                  )}
                </div>
                {application.notes && <p className="notes">{application.notes}</p>}
              </div>
              <div className="card-actions">
                <button className="small-button" onClick={() => editApplication(application.id)}>Edit</button>
                <button className="small-button delete" onClick={() => deleteApplication(application.id)}>Delete</button>
              </div>
            </article>
          ))}
        </section>

        {!loading && applications.length > 0 && (
          <nav className="pagination" aria-label="Application pages">
            <button className="button secondary" disabled={page <= 0} onClick={() => setPage((value) => value - 1)}>← Previous</button>
            <span>Page {page + 1} of {totalPages}</span>
            <button className="button secondary" disabled={page >= totalPages - 1} onClick={() => setPage((value) => value + 1)}>Next →</button>
          </nav>
        )}
      </main>

      <footer><span>JobTrack</span><span>Built with React · Spring Boot · H2 / MySQL</span></footer>

      <dialog
        ref={dialogRef}
        onClose={() => setDialogOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setDialogOpen(false);
        }}
      >
        <form onSubmit={submitApplication}>
          <div className="dialog-heading">
            <div><p className="eyebrow">KEEP IT MOVING</p><h2>{editingId ? "Edit application" : "Add application"}</h2></div>
            <button type="button" className="icon-button" aria-label="Close" onClick={() => setDialogOpen(false)}>×</button>
          </div>
          <div className="form-grid">
            <label>Company name *<input name="company" value={form.company} onChange={updateForm} maxLength="120" required placeholder="e.g. TCS" /></label>
            <label>Job title *<input name="jobTitle" value={form.jobTitle} onChange={updateForm} maxLength="120" required placeholder="e.g. Java Developer" /></label>
            <label>Job type<select name="jobType" value={form.jobType} onChange={updateForm}><option value="">Choose type</option><option>Full-time</option><option>Internship</option><option>Contract</option><option>Part-time</option></select></label>
            <label>Location<input name="location" value={form.location} onChange={updateForm} maxLength="120" placeholder="e.g. Lucknow / Hybrid" /></label>
            <label>Status<select name="status" value={form.status} onChange={updateForm} required>{STATUSES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label>Application date *<input name="applicationDate" type="date" value={form.applicationDate} onChange={updateForm} required /></label>
            <label>Interview date<input name="interviewDate" type="date" value={form.interviewDate} onChange={updateForm} /></label>
            <label>Job posting URL<input name="jobUrl" type="url" value={form.jobUrl} onChange={updateForm} maxLength="500" placeholder="https://…" /></label>
            <label className="full-width">Notes<textarea name="notes" value={form.notes} onChange={updateForm} rows="3" maxLength="2000" placeholder="Recruiter details, next steps, preparation notes…" /></label>
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="dialog-actions">
            <button type="button" className="button secondary" onClick={() => setDialogOpen(false)}>Cancel</button>
            <button type="submit" className="button primary">Save application</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function labelFor(status) {
  return STATUSES.find(([value]) => value === status)?.[1] || status;
}

createRoot(document.getElementById("root")).render(<App />);
