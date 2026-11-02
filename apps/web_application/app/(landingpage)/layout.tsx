import { Navbar } from "@/components/LandingPage/navbar";
import { Footer } from "@/components/LandingPage/footer";
import { MotionProvider } from "@/components/LandingPage/motion-provider";

export default function LandingPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-mist text-foreground selection:bg-ember selection:text-on-ember flex flex-col overflow-x-hidden">
      <MotionProvider>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </MotionProvider>
    </div>
  );
}
