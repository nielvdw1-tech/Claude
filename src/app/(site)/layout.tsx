import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import MobileStickyCTA from "@/components/MobileStickyCTA";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pb-20 sm:pb-0">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MobileStickyCTA />
    </>
  );
}
