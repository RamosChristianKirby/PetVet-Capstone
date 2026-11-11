import { FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { api, errorMessage } from "../../../lib/api";
import { Badge, ErrorNotice, Page } from "../../../components/shared/Page";
import type { ScanResult } from "../../../lib/types";

export default function Scan() {
  const [rfid, setRfid] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.get<ScanResult>(
        "/pets/rfid/" + encodeURIComponent(rfid.trim()),
      );
      setResult(data);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title="A tag. A connection."
      description="Scan or enter an RFID number to find a registered companion."
    >
      <section className="panel scan-panel">
        <span className="scan-icon">
          <ScanLine size={40} />
        </span>
        <h2>Find a pet</h2>
        <p className="muted">
          Use a keyboard-compatible RFID reader, or enter the number on the tag.
        </p>
        <form onSubmit={submit}>
          <label className="field">
            RFID number
            <input
              ref={input}
              autoFocus
              value={rfid}
              onChange={(event) => {
                setRfid(event.target.value);
                setResult(null);
                setError("");
              }}
              disabled={busy}
              required
              minLength={5}
              maxLength={64}
              pattern="[A-Za-z0-9-]{5,64}"
              placeholder="Scan or type the RFID number"
              autoComplete="off"
            />
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Looking up…" : "Look up pet"}
          </button>
        </form>
        {error && <ErrorNotice message={error} />}
      </section>
      {result && (
        <section className="panel scan-result">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MATCH FOUND</span>
              <h2>{result.petName}</h2>
            </div>
            <Badge value={result.status} />
          </div>
          <dl className="details-grid">
            <div>
              <dt>RFID</dt>
              <dd>{result.rfid}</dd>
            </div>
            <div>
              <dt>Breed</dt>
              <dd>
                {result.breed1}
                {result.breed2 ? " / " + result.breed2 : ""}
              </dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{result.ownerName}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>
                <a href={"tel:" + result.contact}>{result.contact}</a>
              </dd>
            </div>
            <div className="wide">
              <dt>Recovery address</dt>
              <dd>{result.address}</dd>
            </div>
          </dl>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setRfid("");
                setResult(null);
                input.current?.focus();
              }}
            >
              Scan another
            </button>
            <Link
              className="btn btn-primary"
              to={"/dashboard/pets/" + result._id}
            >
              Open pet profile
            </Link>
          </div>
        </section>
      )}
    </Page>
  );
}
