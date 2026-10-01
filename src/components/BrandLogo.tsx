import Image from "next/image";
import { companyInfo } from "@/data/content";

/**
 * The official logo, used exactly as supplied (/public/logo.png): never
 * recoloured or redrawn. The artwork sits in a square canvas with even
 * transparent margins, so the box below shows only the mark (≈1.25 : 1).
 *
 * The logo's navy disappears on the site's near-black ground, so on dark
 * surfaces (`plate`) it is set on an ivory plate — like a bookplate — rather than altered.
 */
const ASPECT = 1963 / 1571;

export function BrandLogo({
  hasLogo,
  height = 40,
  plate = false,
  priority = false,
}: {
  hasLogo: boolean;
  height?: number;
  plate?: boolean;
  priority?: boolean;
}) {
  if (!hasLogo) {
    return (
      <span className="brand-placeholder" style={{ height }} aria-label={companyInfo.logo.alt}>
        {companyInfo.shortName}
      </span>
    );
  }
  const width = Math.round(height * ASPECT);
  return (
    <span className={`brand-logo ${plate ? "brand-logo--plate" : ""}`}>
      <Image
        src={companyInfo.logo.src}
        alt={companyInfo.logo.alt}
        width={2000}
        height={2000}
        sizes={`${width * 2}px`}
        priority={priority}
        style={{ width, height, objectFit: "cover", objectPosition: "center", display: "block" }}
      />
    </span>
  );
}
