import { NotFoundURL } from "@/lib/socialLogos";
import Image from "next/image";
import Link from "next/link";

interface LinkErrorProps {
  type: string;
}

export function LinkError({ type }: LinkErrorProps) {
  const isExpired = type === "link_expired"
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e4fdb0] overflow-hidden px-6 md:px-16 relative font-ubuntu">
      <div className="max-w-350 w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        <div className="flex flex-col items-start gap-8 z-20 shrink-0 mt-20 md:mt-0">
          <h1 
            className="text-[#012f2c] font-black uppercase leading-[0.8] tracking-tighter m-0 p-0"
            style={{ fontSize: "clamp(80px, 12vw, 220px)" }}
          >
            {isExpired ? (
              <>LINK<br/>HAS<br/>EXPIRED</>
            ) : (
              <>PAGE<br/>NOT<br/>FOUND</>
            )}
          </h1>
          <Link
            className="bg-black hover:bg-black/80 text-white font-bold tracking-widest uppercase px-10 py-4 text-sm ml-2 md:ml-4"
            href="/"
          >
            GO HOME
          </Link>
        </div>

        {/* Right Content / Image */}
        <div className="relative flex-1 flex items-center justify-center min-h-100 md:min-h-175 w-full mt-8 md:mt-0" suppressHydrationWarning>
          {/* Giant '4' Background */}
          {!isExpired && (
            <div 
              className="absolute right-[-10%] md:right-[-5%] top-1/2 -translate-y-1/2 text-[#b4f044] font-black leading-none select-none -z-10 tracking-tighter"
              style={{ fontSize: "clamp(300px, 50vw, 800px)" }}
              suppressHydrationWarning
            >
              <span>4*4</span>
            </div>
          )}
          
          <div className="relative w-full max-w-64 md:max-w-100 lg:max-w-125 aspect-3/4 z-10 md:mr-12 animate-in fade-in zoom-in duration-1000" suppressHydrationWarning>
            <Image
              src={NotFoundURL}
              alt="Not Found Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
