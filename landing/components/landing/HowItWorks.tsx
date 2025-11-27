import { SITE_CONFIG } from "@/constants/site";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 bg-background-gray">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Three simple steps to deeper connection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {SITE_CONFIG.howItWorks.map((step) => (
            <Card key={step.step} className="border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                  {step.step}
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-text-secondary">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

