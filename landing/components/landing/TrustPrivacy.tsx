import { SITE_CONFIG } from "@/constants/site";
import { Card, CardContent } from "@/components/ui/card";

export function TrustPrivacy() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 bg-background-gray">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Trust & Privacy
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Your privacy is our top priority
          </p>
        </div>

        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {SITE_CONFIG.trust.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-yummy text-xl">✓</span>
                  <p className="text-text-primary">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

