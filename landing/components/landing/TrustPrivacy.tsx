import { SITE_CONFIG } from "@/constants/site";

export function TrustPrivacy() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Trust & Privacy
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto drop-shadow-md">
            Your privacy is our top priority
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          {SITE_CONFIG.trust.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-yummy text-xl">✓</span>
                  <p className="text-white drop-shadow-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

