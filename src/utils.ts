import { BASE } from "./consts";

export const getUrlWithBase = (href: string) => {
  return `/${href}`
  //return `${BASE}/${href}`;
};
