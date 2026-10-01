"use client";

import { companyInfo } from "@/data/content";
import { goToChapter, goToConsultation } from "@/lib/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer({ hasLogo }: { hasLogo: boolean }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <BrandLogo hasLogo={hasLogo} height={84} plate />
        <span>
          {companyInfo.legalName} · {companyInfo.city}, {companyInfo.state}
        </span>
      </div>
      <nav aria-label="Footer" className="site-footer__nav caps">
        <button type="button" onClick={() => goToChapter("prologue")}>
          Prologue
        </button>
        <button type="button" onClick={() => goToChapter("destinations")}>
          Destinations
        </button>
        <button type="button" onClick={() => goToConsultation()}>
          Contact
        </button>
      </nav>
    </footer>
  );
}
