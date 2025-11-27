import { SITE_CONFIG } from "@/constants/site";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Pricing
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto drop-shadow-md">
            Start free, upgrade when you&apos;re ready
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white">{SITE_CONFIG.pricing.free.name}</CardTitle>
              <CardDescription className="text-lg mt-2 text-white">Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {SITE_CONFIG.pricing.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yummy">✓</span>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary text-white hover:bg-primary-dark mt-6 shadow-lg font-bold">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="border-primary border-2 relative bg-white/10 backdrop-blur-sm">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-white">{SITE_CONFIG.pricing.premium.name}</CardTitle>
              <CardDescription className="text-lg mt-2 text-white">
                {SITE_CONFIG.pricing.premium.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white italic drop-shadow-sm">
                Perfect anniversary / Valentine&apos;s / &apos;spice it up&apos; gift
              </p>
              <ul className="space-y-3">
                {SITE_CONFIG.pricing.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yummy">✓</span>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary text-white hover:bg-primary-dark mt-6 shadow-lg font-bold">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

