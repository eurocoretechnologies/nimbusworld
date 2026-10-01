export interface LineArtState {
  /** 0..1 of the drawing inked in, bottom-up. */
  draw: number;
  /** 0..1 folded back down into the page. */
  fold: number;
  opacity?: number;
}
