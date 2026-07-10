import { Navbar } from "@/components/LandingPage/navbar";
import { Footer } from "@/components/LandingPage/footer";

export default function LandingPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#f8f6f2] text-zinc-950 font-sans selection:bg-[#4a044e] selection:text-white flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
