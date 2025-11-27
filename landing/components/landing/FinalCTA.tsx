import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/constants/site";

export function FinalCTA() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 bg-gradient-to-br from-primary/10 to-lavender/10">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
          Start Your Journey Together
        </h2>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Download Peek now and discover what you both want
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            size="lg" 
            className="bg-primary text-white hover:bg-primary-dark px-8 py-6 text-lg"
          >
            Download for iOS
          </Button>
          <Button 
            size="lg" 
            className="bg-primary text-white hover:bg-primary-dark px-8 py-6 text-lg"
          >
            Download for Android
          </Button>
        </div>

        {/* App Store Badges Placeholder */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
          <div className="w-40 h-12 bg-text-tertiary/20 rounded-lg flex items-center justify-center">
            <span className="text-xs text-text-secondary">App Store Badge</span>
          </div>
          <div className="w-40 h-12 bg-text-tertiary/20 rounded-lg flex items-center justify-center">
            <span className="text-xs text-text-secondary">Google Play Badge</span>
          </div>
        </div>
      </div>
    </section>
  );
}

