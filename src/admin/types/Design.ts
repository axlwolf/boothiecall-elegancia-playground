export type Design = {
  id: string;
  name: string;
  layoutType: '1-shot' | '3-shot' | '4-shot' | '6-shot';
  frameMappings: string; // JSON string
  isActive: boolean;
};
