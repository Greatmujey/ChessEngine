import Nav from "./components/Nav";
import Hero from "./components/Hero";
import PlaySection from "./components/PlaySection";
import SourceSection from "./components/SourceSection";
import BudgetSection from "./components/BudgetSection";
import BountySection from "./components/BountySection";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="grain min-h-screen bg-void text-ivory antialiased">
      <Nav />
      <main>
        <Hero />
        <PlaySection />
        <SourceSection />
        <BudgetSection />
        <BountySection />
      </main>
      <Footer />
    </div>
  );
}
