import { SITE_CONFIG } from "@/constants/site";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Pricing
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">{SITE_CONFIG.pricing.free.name}</CardTitle>
              <CardDescription className="text-lg mt-2">Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {SITE_CONFIG.pricing.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yummy">✓</span>
                    <span className="text-text-primary">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary text-white hover:bg-primary-dark mt-6">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="border-primary border-2 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{SITE_CONFIG.pricing.premium.name}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {SITE_CONFIG.pricing.premium.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary italic">
                Perfect anniversary / Valentine&apos;s / &apos;spice it up&apos; gift
              </p>
              <ul className="space-y-3">
                {SITE_CONFIG.pricing.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yummy">✓</span>
                    <span className="text-text-primary">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary text-white hover:bg-primary-dark mt-6">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

