import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/constants/site";

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
      <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary">
            {SITE_CONFIG.messaging.hero}
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto">
            {SITE_CONFIG.messaging.heroSub}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            size="lg" 
            className="bg-primary text-white hover:bg-primary-dark px-8 py-6 text-lg"
          >
            Download for iOS
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg"
          >
            Download for Android
          </Button>
        </div>

        <p className="text-sm text-text-tertiary flex items-center gap-2">
          <span className="text-yummy">🔒</span>
          {SITE_CONFIG.messaging.trust}
        </p>

        {/* Hero Visual Placeholder */}
        <div className="mt-12 w-full max-w-md mx-auto">
          <div className="aspect-[9/16] bg-gradient-to-br from-primary/20 to-lavender/20 rounded-2xl border border-primary/20 flex items-center justify-center">
            <p className="text-text-secondary text-sm">App Mockup</p>
          </div>
        </div>
      </div>
    </section>
  );
}

