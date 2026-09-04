drop trigger if exists check_tx_invariant_after_insert;

drop trigger if exists check_tx_invariant_after_update;

drop trigger if exists check_tx_invariant_after_delete;

create trigger check_holdings_before_insert_sell before insert on transactions for each row when new.type = 'sell' begin
select
    case
        when (
            select
                holdings
            from
                assets_ext a
            where
                id = new.asset_id
        ) < new.quantity then raise (abort, 'Insufficient holdings')
    end;

end;

create trigger check_holdings_before_update_sell before
update on transactions for each row when new.type = 'sell' begin
select
    case
        when (
            select
                holdings
            from
                assets_ext a
            where
                id = new.asset_id
        ) < new.quantity then raise (abort, 'Insufficient holdings')
    end;

end;