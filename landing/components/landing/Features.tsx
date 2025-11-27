import { SITE_CONFIG } from "@/constants/site";

export function Features() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Key Features
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto drop-shadow-md">
            Everything you need to explore together safely and privately
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SITE_CONFIG.features.map((feature, index) => (
            <div key={index} className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">{feature.title}</h3>
              <p className="text-base text-white drop-shadow-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

