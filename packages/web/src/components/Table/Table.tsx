import { useState } from "react";
import { Table } from "react-bootstrap";
import { itemsByPage, Pager } from "../Pager/Pager";

export type PagedTableProps<T, P extends object = {}> = {
  header: (props: PagedTableProps<T, P>) => React.ReactNode;
  row: (item: T, idx: number, props: PagedTableProps<T, P>) => React.ReactNode;
  items: T[];
  pageSize?: number;
} & P;

export const PagedTable = function <T, P extends object = {}>(
  props: PagedTableProps<T, P>
): ReturnType<React.FC<PagedTableProps<T>>> {
  const { header, row, items, pageSize = 10 } = props;
  const [page, setPage] = useState(0);
  const pagedItems = itemsByPage(items, pageSize, page);
  return (
    <>
      <Table responsive striped hover>
        {header(props)}
        <tbody>
          {pagedItems.map((items, idx) =>
            row(items, page * pageSize + idx, props)
          )}
        </tbody>
      </Table>
      <Pager
        onClick={setPage}
        currentPage={page}
        pageSize={pageSize}
        totalItems={items.length}
        hidden={items.length <= pageSize}
      />
    </>
  );
};
