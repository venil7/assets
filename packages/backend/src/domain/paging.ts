export type Paging = { limit: number; offset: number };
export const paging = (limit = 500, offset = 0): Paging => ({
  limit,
  offset
});
export const defaultPaging = () => paging();
