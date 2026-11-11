import type { ReactNode } from "react";
import { AlertCircle, Loader2, PawPrint, Search } from "lucide-react";

export function Page({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">PETVET / CARE WORKSPACE</p>
          <h1>{title}</h1>
          {description && <p className="muted">{description}</p>}
        </div>
        <div className="actions">{actions}</div>
      </header>
      {children}
    </div>
  );
}
export function Loading() {
  return (
    <div className="state" role="status">
      <Loader2 className="animate-spin" size={24} />
      <p>Loading your workspace…</p>
    </div>
  );
}
export function ErrorNotice({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="notice error" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      {retry && (
        <button className="btn btn-secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Empty({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <div className="state">
      <div className="empty-icon">
        <PawPrint size={28} />
      </div>
      <h3>{title}</h3>
      {detail && <p className="muted">{detail}</p>}
      {children}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search records…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search-box">
      <Search size={18} />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Badge({ value }: { value: string }) {
  return <span className={"badge badge-" + value.toLowerCase()}>{value}</span>;
}
