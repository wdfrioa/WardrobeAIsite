import Background from "@/components/Background";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Showcase from "@/components/Showcase";
import AIDemo from "@/components/AIDemo";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Download from "@/components/Download";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Background />
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Showcase />
        <AIDemo />
        <Testimonials />
        <FAQ />
        <Download />
      </main>
      <Footer />
    </>
  );
}