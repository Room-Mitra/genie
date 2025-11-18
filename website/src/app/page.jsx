import CTA from '../components/ui/FrontDesk';
import Features from '../components/ui/Features';
import Hero from '../components/ui/Hero';
import Pricing from '../components/ui/Pricing';
import VisualFeatures from '../components/ui/UseCases';

export default function Page() {
  return (
    <>
      <main>
        <Hero />
        <VisualFeatures />
        <CTA />
        <Features />
        <Pricing />
      </main>
    </>
  );
}
