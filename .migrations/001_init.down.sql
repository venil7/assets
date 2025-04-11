drop table  if exists users;
drop table  if exists assets;
drop table  if exists portfolios;
drop table  if exists transactions;

drop view if exists portfolios_ext;
drop view if exists asset_transactions;
drop view if exists asset_holdings;
drop view if exists assets_contributions;

drop trigger if exists check_holdings_before_insert_sell;
drop trigger if exists check_holdings_before_update_sell;

