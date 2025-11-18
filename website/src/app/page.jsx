import FrontDesk from '@/src/components/ui/FrontDesk';
import Features from '@/src/components/ui/Features';
import Hero from '@/src/components/ui/Hero';
import Pricing from '@/src/components/ui/Pricing';
import UseCases from '@/src/components/ui/UseCases';
import BookADemo from '../components/ui/BookADemo/bookADemo';

export default function Page() {
  return (
    <>
      <Hero />
      <UseCases />
      <FrontDesk />
      <Features />
      <Pricing />
      <BookADemo />
    </>
  );
}
