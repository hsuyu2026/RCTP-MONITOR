export type Language = 'zh' | 'en';
export type MapMode = '3d' | '2d' | 'chart';

export interface SettingsState {
  language: Language;
  mapMode: MapMode;
  showAtc: boolean;
  bigVideoMode: boolean;
  hideVideoTitle: boolean;
  autoCycle: boolean;
  cycleInterval: number;
  fullScreen: boolean;
  largeClock: boolean;
  hideTopText: boolean;
  preventTouch: boolean;
  refreshKey: number;
}

export type MarqueeSegment = string | { text: string; color: string; bold?: boolean };
