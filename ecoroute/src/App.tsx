import { useEffect, useState } from "react";
import RoutePlannerDashboard from "./pages/RoutePlannerDashboard";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import LandingPage from "./pages/LandingPage";
import FlightLookupPage from "./pages/FlightLookupPage";
import Navbar from "./components/Navbar";
import LoginModal from "./components/Auth/LoginModal";

function getHashRoute(hash: string) {
  if (!hash || hash === "#/" || hash === "#") {
    return "/";
  }

  const route = hash.startsWith("#") ? hash.slice(1) : hash;
  return route.startsWith("/") ? route : `/${route}`;
}

export default function App() {
  const [route, setRoute] = useState(() => getHashRoute(window.location.hash));
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'login' | 'signup'>('login');

  const openLogin = () => { setLoginTab('login'); setIsLoginOpen(true); };
  const openSignUp = () => { setLoginTab('signup'); setIsLoginOpen(true); };

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getHashRoute(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const page =
    route === "/planner" ? (
      <RoutePlannerDashboard />
    ) : route === "/flights" ? (
      <FlightLookupPage />
    ) : route === "/about" ? (
      <AboutPage />
    ) : route === "/account" ? (
      <AccountPage />
    ) : (
      <LandingPage onSignUpClick={openSignUp} onLoginClick={openLogin} />
    );

  return (
    <div className="flex h-screen flex-col bg-eco-bg text-eco-text">
      <Navbar route={route} onLoginClick={openLogin} />

      <main className="min-h-0 flex-1 overflow-hidden">{page}</main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={loginTab} />
    </div>
  );
}
