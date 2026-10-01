import { existsSync } from "node:fs";
import path from "node:path";
import { Experience } from "@/components/Experience";

export default function Home() {
  // The official logo is used only when the supplied file is present.
  const hasLogo = existsSync(path.join(process.cwd(), "public", "logo.png"));
  return <Experience hasLogo={hasLogo} />;
}
