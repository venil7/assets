### Trading 212

```sql
select
  case
    when Action like'%buy' then 'buy'
    when Action like'%sell' then 'sell'
    else '-'
  end as type,
strftime(Time, '%c') as date,
Ticker as ticker,
"No. of shares" as quantity,
"Price / share" as price,
ID as comments
from trading212 -- from exported CSV
-- where Ticker='MCD'
```
