import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  PawPrint,
  ScanLine,
  CalendarDays,
  HeartHandshake,
} from "lucide-react";
import pets from "../../assets/pets.png";
export default function Main() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div>
          <p className="eyebrow">
            <span className="status-dot" />
            CONNECTED PET CARE · CAGAYAN DE ORO
          </p>
          <h1>
            Every pet deserves
            <br />
            to be <em>known.</em>
          </h1>
          <p>
            A small tag connects a companion to their people.
            <br />
            PetVet brings identification, health records, and veterinary visits
            together.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" to="/auth/signup">
              Join PetVet
              <ArrowUpRight size={18} />
            </Link>
            <Link className="btn btn-secondary" to="/auth/login">
              Open my workspace
            </Link>
          </div>
          <span className="hero-footnote">
            <PawPrint size={16} />
            For the lives that make ours a little better.
          </span>
        </div>
        <div className="landing-image">
          <span className="image-orbit" />
          <img src={pets} alt="Pets gathered together" />
          <span className="floating-label">
            <HeartHandshake size={21} />
            Every companion counts.
          </span>
        </div>
      </section>
      <section className="feature-grid" aria-label="PetVet features">
        {[
          {
            icon: ScanLine,
            title: "An identity that stays.",
            text: "Connect each RFID tag to a pet profile and recovery contact.",
          },
          {
            icon: PawPrint,
            title: "Their story, together.",
            text: "Keep pet details, confirmed vaccinations, and care remarks in one place.",
          },
          {
            icon: CalendarDays,
            title: "Care that keeps going.",
            text: "Book appointments and follow every visit through to completion.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={25} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
