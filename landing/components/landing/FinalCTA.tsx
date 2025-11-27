import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/constants/site";

export function FinalCTA() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          Start Your Journey Together
        </h2>
        <p className="text-xl text-white max-w-2xl mx-auto drop-shadow-md">
          Download Peek now and discover what you both want
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            size="lg" 
            className="bg-primary text-white hover:bg-primary-dark px-8 py-6 text-lg shadow-lg font-bold"
          >
            Download for iOS
          </Button>
          <Button 
            size="lg" 
            className="bg-primary text-white hover:bg-primary-dark px-8 py-6 text-lg shadow-lg font-bold"
          >
            Download for Android
          </Button>
        </div>

        {/* App Store Badges Placeholder */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
          <div className="w-40 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-xs text-white">App Store Badge</span>
          </div>
          <div className="w-40 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-xs text-white">Google Play Badge</span>
          </div>
        </div>
      </div>
    </section>
  );
}

