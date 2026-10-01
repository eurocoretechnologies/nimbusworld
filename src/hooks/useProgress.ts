"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useExperience } from "@/store/experience";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Applies styles straight from master progress on every scroll tick without
 * re-rendering — DOM overlays scrub with the film and reverse with it.
 */
export function useScrub<T extends HTMLElement>(ref: RefObject<T | null>, apply: (el: T, p: number) => void) {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    applyRef.current(el, useExperience.getState().progress);
    return useExperience.subscribe((s, prev) => {
      if (s.progress !== prev.progress && ref.current) applyRef.current(ref.current, s.progress);
    });
  }, [ref]);
}

/** A value derived from progress; the component re-renders only when the value changes. */
export function useProgressValue<V>(fn: (p: number) => V): V {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [value, setValue] = useState(() => fn(useExperience.getState().progress));
  useEffect(() => {
    setValue(fnRef.current(useExperience.getState().progress));
    return useExperience.subscribe((s) => {
      const next = fnRef.current(s.progress);
      setValue((prev) => (Object.is(prev, next) ? prev : next));
    });
  }, []);
  return value;
}
