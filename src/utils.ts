import { BASE } from "./consts";

export const getUrlWithBase = (href: string) => {
  return `${BASE}/${href}`;
};
