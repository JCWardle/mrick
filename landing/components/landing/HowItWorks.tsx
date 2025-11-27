import { SITE_CONFIG } from "@/constants/site";

export function HowItWorks() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            How It Works
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto drop-shadow-md">
            Three simple steps to deeper connection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {SITE_CONFIG.howItWorks.map((step) => (
            <div key={step.step} className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-lg">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">{step.title}</h3>
              <p className="text-base text-white drop-shadow-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

