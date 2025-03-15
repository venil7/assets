export type Paging = [limit: number, offset: number];
export const defaultPaging = (): Paging => [50, 0];
