--tables
create table
    users (
        id integer primary key autoincrement,
        username text not null,
        phash text not null,
        psalt text not null,
        admin bool not null,
        created datetime default current_timestamp,
        modified datetime default current_timestamp,
        unique (username)
    );

create table
    assets (
        id integer primary key autoincrement,
        portfolio_id integer not null,
        ticker text not null,
        name text not null,
        created datetime default current_timestamp,
        modified datetime default current_timestamp,
        foreign key (portfolio_id) references portfolios (id) ON DELETE CASCADE,
        unique (ticker, portfolio_id)
    );

create table
    portfolios (
        id integer primary key autoincrement,
        user_id integer not null,
        name text not null,
        description text,
        created datetime default current_timestamp,
        modified datetime default current_timestamp,
        foreign key (user_id) references users (id) ON DELETE CASCADE,
        unique (user_id, name)
    );

create table
    transactions (
        id integer primary key autoincrement,
        asset_id integer not null,
        type text not null check (type in ('buy', 'sell')),
        quantity real not null,
        price real not null,
        date date default current_timestamp,
        created datetime default current_timestamp,
        modified datetime default current_timestamp,
        foreign key (asset_id) references assets (id) ON DELETE CASCADE
    );

-- views
drop view if exists asset_transactions;

create view
    asset_transactions as
select
    t.*,
    a.name,
    a.ticker,
    p.name as portfolio_name,
    p.description as portfolio_description,
    p.user_id
from
    transactions t
    inner join assets a on a.id = t.asset_id
    inner join portfolios p on p.id = a.portfolio_id;

drop view if exists asset_holdings;

create view
    if not exists asset_holdings as
select
    sub.*,
    case
        when sub.holdings = 0 then null
        else sub.invested / sub.holdings
    end as avg_price
from
    (
        select
            a.*,
            u.id as user_id,
            coalesce(
                sum(
                    case
                        when t.type = 'buy' then t.quantity
                        else - t.quantity
                    end
                ),
                0
            ) as holdings,
            coalesce(
                sum(
                    case
                        when t.type = 'buy' then t.quantity * t.price
                        else - t.quantity * t.price
                    end
                ),
                0
            ) as invested,
            count(t.id) as num_tx
        from
            assets a
            inner join portfolios p on p.id = a.portfolio_id
            left join transactions t on t.asset_id = a.id
            inner join users u on u.id = p.user_id
        group by
            a.id,
            a.name
    ) as sub;

drop view if exists portfolios_ext;

create view
    portfolios_ext as
select
    p.*,
    coalesce(a.total_invested, 0) as total_invested,
    coalesce(a.num_assets, 0) as num_assets
from
    portfolios p
    left join (
        select
            portfolio_id,
            sum(invested) as total_invested,
            count(id) as num_assets
        from
            asset_holdings
        group by
            portfolio_id
    ) as a on p.id = a.portfolio_id;

drop view if exists assets_contributions;

create view
    assets_contributions as
select
    ah.*,
    coalesce(ah.invested / coalesce(pt.total_invested, 1), 0) as portfolio_contribution
from
    asset_holdings ah
    left join portfolios_ext pt on ah.portfolio_id = pt.id;

-- triggers
drop trigger if exists check_holdings_before_insert_sell;

create trigger check_holdings_before_insert_sell before insert on transactions for each row when new.type = 'sell' begin
select
    case
        when (
            select
                holdings
            from
                asset_holdings a
            where
                id = new.asset_id
        ) < new.quantity then raise (abort, 'Insufficient holdings')
    end;

end;

drop trigger if exists check_holdings_before_update_sell;

create trigger check_holdings_before_update_sell before
update on transactions for each row when new.type = 'sell' begin
select
    case
        when (
            select
                holdings
            from
                asset_holdings a
            where
                id = new.asset_id
        ) < new.quantity then raise (abort, 'Insufficient holdings')
    end;

end;