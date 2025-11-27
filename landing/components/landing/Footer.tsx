import Image from "next/image";
import { SITE_CONFIG } from "@/constants/site";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-background-gray border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt={`${SITE_CONFIG.name} Logo`}
                width={40}
                height={40}
                className="object-contain"
              />
              <h3 className="text-xl font-bold text-text-primary">{SITE_CONFIG.name}</h3>
            </div>
            <p className="text-text-secondary max-w-md">
              {SITE_CONFIG.tagline}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-text-secondary hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-text-secondary hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="text-text-secondary hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/support" className="text-text-secondary hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-text-tertiary text-sm">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

