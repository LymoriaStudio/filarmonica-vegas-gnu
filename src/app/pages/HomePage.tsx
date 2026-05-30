import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Stats } from "../components/Stats";
import { Team } from "../components/Team";
import { Gallery } from "../components/Gallery";
import { Instruments } from "../components/Instruments";
import { Events } from "../components/Events";
import { Contact } from "../components/Contact";
import { Testimonials } from "../components/Testimonials";
import { Sponsors } from "../components/Sponsors";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar transparent />
      <Hero />
      <Stats />
      <Team />
      <Gallery />
      <Instruments />
      <Events />
      <Sponsors />
      <Testimonials />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
}
