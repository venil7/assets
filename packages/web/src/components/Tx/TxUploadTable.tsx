import { ccyToLocale, type Ccy, type PostTx } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { withCondition } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { iso } from "../../util/date";
import { decimalFormatter, moneyFormatter } from "../../util/number";
import { Dark } from "../Form/Alert";
import { PagedTable } from "../Table/Table";

export type TxUploadTableExtProps = { currency: Ccy };

const TxUploadHeader = () => (
  <thead>
    <tr>
      <th>Type</th>
      <th>Quantity</th>
      <th>Price/Unit</th>
      <th>Comments</th>
      <th className="d-none d-md-block">Date</th>
    </tr>
  </thead>
);

const TxUploadItem = (
  item: PostTx,
  idx: number,
  { currency }: TxUploadTableExtProps
) => {
  const locale = ccyToLocale(currency);
  const money = moneyFormatter(currency, locale);
  const decimal = decimalFormatter(locale);
  return (
    <tr key={idx}>
      <td>{item.type}</td>
      <td>{decimal(item.quantity, 5)}</td>
      <td>{money(item.price)}</td>
      <td>{item.comments}</td>
      <td className="d-none d-md-table-cell">{iso(item.date)}</td>
    </tr>
  );
};

export const TxUploadTable = pipe(
  PagedTable<PostTx, TxUploadTableExtProps>,
  withProps({
    header: TxUploadHeader,
    row: TxUploadItem,
    pageSize: 5,
  }),
  withCondition(
    (p) => p.items.length > 0,
    () => <Dark>transactions appear here when uploaded</Dark>
  )
);
