export const ApiUrl = {
  ROUTE: (() => {
    const BASE = 'routes/';
    return {
      BASE,
      DETAIL: (id: string) => `${BASE}${id}`,
      RESET: `${BASE}reset`,
    };
  })(),
};
