import { HomeNavbar } from "@/components/HomePage/navbar";
import { Hero } from "@/components/HomePage/hero";
import { ServicesList } from "@/components/HomePage/service-list";
import { HowItWorksList } from "@/components/HomePage/how-to-use";
import { Features } from "@/components/HomePage/features";
import { Faq } from "@/components/HomePage/faq";
import { Footer } from "@/components/HomePage/footer";

export default function HomePage() {
  return (
    <>
      <HomeNavbar />
      <main>
        <Hero />
        <ServicesList />
        <HowItWorksList />
        <Features />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
