export type DailySessions = {
  date: string; // YYYY-MM-DD
  count: number;
};

export type PopularFilter = {
  name: string;
  usageCount: number;
};

export type LayoutUsage = {
  layoutType: '1-shot' | '3-shot' | '4-shot' | '6-shot';
  count: number;
};
