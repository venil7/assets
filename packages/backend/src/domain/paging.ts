export type Paging = { limit: number; offset: number };
export const defaultPaging = (): Paging => ({ limit: 50, offset: 0 });
