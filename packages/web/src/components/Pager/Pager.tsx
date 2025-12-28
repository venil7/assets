import * as A from "fp-ts/lib/Array";
import { identity, pipe } from "fp-ts/lib/function";
import Pagination from "react-bootstrap/Pagination";

export type PagerPros = {
  totalItems: number;
  currentPage?: number;
  pageSize?: number;
  onClick: (p: number) => void;
};

export const totalPages = (totalItems: number, pageSize: number): number =>
  Math.floor(totalItems / pageSize) + (totalItems % pageSize > 0 ? 1 : 0);

export function itemsByPage<T>(
  items: T[],
  pageSize: number,
  page: number //0 index
): T[] {
  if (page >= 0 && page <= totalPages(items.length, pageSize)) {
    const start = page * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }
  return [];
}

export const Pager: React.FC<PagerPros> = ({
  totalItems,
  pageSize = 10,
  currentPage = 0,
  onClick,
}) => {
  const tPages = totalPages(totalItems, pageSize);
  currentPage = currentPage >= 0 && currentPage <= tPages ? currentPage : 0;
  const handleClick = (p: number) => () => onClick(p);
  const pages =
    tPages <= 5
      ? A.makeBy(tPages, identity)
      : pipe(
          A.makeBy(7, identity),
          A.map((p) => p + currentPage - 2),
          A.filter((p) => p >= 0 && p < tPages),
          A.takeLeft(5)
        );
  return (
    <Pagination>
      <Pagination.First onClick={handleClick(0)} />
      {pages.map((p) => (
        <Pagination.Item
          key={p}
          onClick={handleClick(p)}
          active={p == currentPage}
        >
          {p + 1}
        </Pagination.Item>
      ))}
      <Pagination.Last onClick={handleClick(tPages - 1)} />
    </Pagination>
  );
};
