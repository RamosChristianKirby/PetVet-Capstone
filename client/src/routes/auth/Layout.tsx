import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PawPrint, ArrowLeft, ScanLine } from "lucide-react";
import pets from "../../assets/pets.png";
export default function AuthLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <PawPrint />
          </span>
          <div>
            PetVet<small>CARE, CONNECTED.</small>
          </div>
        </Link>
        <div>
          <p className="eyebrow">FOR EVERY PAW, EVERY DAY</p>
          <h2>
            They bring the love.
            <br />
            We connect the care.
          </h2>
          <p>
            One place for their identity, their history,
            <br />
            and a healthier tomorrow.
          </p>
          <img src={pets} alt="A group of pet companions" />
        </div>
        <span className="auth-story-foot">
          <ScanLine size={19} />A small tag. A world of care.
        </span>
      </aside>
      <main className="auth-content">
        <Link className="text-link back-home" to="/">
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <div className="auth-card">
          <p className="eyebrow">YOUR PETVET WORKSPACE</p>
          <h1>{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
