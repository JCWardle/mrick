import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/constants/site";

export function Hero() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center px-4 py-16 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center space-y-8">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/logo.png"
            alt={`${SITE_CONFIG.name} Logo`}
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            {SITE_CONFIG.messaging.hero}
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto drop-shadow-md">
            {SITE_CONFIG.messaging.heroSub}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            size="lg" 
            className="bg-primary text-white hover:bg-primary-dark px-8 py-6 text-lg shadow-lg font-bold"
          >
            Download for iOS
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg shadow-lg font-bold bg-white/5 backdrop-blur-sm"
          >
            Download for Android
          </Button>
        </div>

        <p className="text-sm text-white flex items-center gap-2 drop-shadow-sm">
          <span className="text-yummy">🔒</span>
          {SITE_CONFIG.messaging.trust}
        </p>

        {/* Hero Visual Placeholder */}
        <div className="mt-12 w-full max-w-md mx-auto">
          <div className="aspect-[9/16] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
            <p className="text-white text-sm drop-shadow-sm">App Mockup</p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

