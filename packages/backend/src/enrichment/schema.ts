import {
  Bool,
  Datetime,
  Float64,
  Int32,
  String as Pstring,
  Struct
} from "nodejs-polars";

export const RateRecSchema = {
  timestamp: Int32,
  rate: Float64
};

export const ChartTxSchema = {
  type: Pstring,
  quantity: Float64,
  price: Float64
};

export const EnrichedTxSchema = {
  id: Int32,
  ...ChartTxSchema,
  date: Datetime(),
  comments: Pstring,

  asset_id: Int32,
  quantity_ext: Float64,
  stretch: Int32,
  final_stretch: Bool,
  value: Float64,
  pnl: Float64,
  pnl_pct: Float64,
  realized_pnl: Float64,
  cost: Float64,
  cost_basis: Float64,
  contribution: Float64,

  running_holding: Float64,
  running_cost: Float64,
  running_average_price: Float64,
  running_break_even: Float64,
  running_contribution: Float64,

  asset_name: Pstring,
  asset_ticker: Pstring,
  portfolio_name: Pstring,
  portfolio_description: Pstring,
  user_id: Int32,
  user_base_ccy: Pstring,

  timestamp: Int32,
  created: Datetime(),
  modified: Datetime()
};

export const ChartSchema = {
  timestamp: Int32,
  price: Float64,
  volume: Float64,
  tx: Struct(ChartTxSchema)
};
