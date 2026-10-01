"use client";

import { useExperience } from "@/store/experience";

export function SoundToggle() {
  const on = useExperience((s) => s.soundOn);
  const toggle = useExperience((s) => s.toggleSound);
  return (
    <button
      type="button"
      className={`sound-toggle ${on ? "is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? "Sound on — turn off ambient sound" : "Sound off — turn on ambient sound"}
      onClick={toggle}
    >
      <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true">
        <path d="M1 5h2M5 3v4M9 1v8M13 3v4M17 5h-2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
