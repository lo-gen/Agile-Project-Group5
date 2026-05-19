import { useState } from "react";
import AuthButton from "./Auth/AuthButton";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  route: string;
  onLoginClick: () => void;
}

const BASE_LINKS = [
  { label: "Home", href: "#/" },
  { label: "Planner", href: "#/planner" },
  { label: "Education", href: "#/education" },
  { label: "About", href: "#/about" },
];

function isActive(href: string, route: string) {
  const linkRoute = (href.startsWith("#") ? href.slice(1) : href) || "/";
  return linkRoute === "/" ? route === "/" : route === linkRoute;
}

export default function Navbar({ route, onLoginClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    ...BASE_LINKS,
    ...(user ? [{ label: "My History", href: "#/account" }] : []),
  ];

  return (
    <header className="shrink-0 border-b border-eco-border bg-eco-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#/"
          className="text-sm font-semibold uppercase tracking-[0.25em] text-eco-green"
        >
          EcoRoute
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative pb-0.5 text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-eco-green after:transition-transform hover:text-eco-green ${
                isActive(link.href, route)
                  ? "text-eco-green after:scale-x-100"
                  : "text-eco-muted after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AuthButton onLoginClick={onLoginClick} />
          <button
            className="rounded-md p-1.5 text-eco-muted transition hover:bg-eco-border hover:text-eco-text sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-eco-border bg-eco-panel px-4 pb-3 sm:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href, route)
                  ? "text-eco-green"
                  : "text-eco-muted hover:text-eco-text"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
