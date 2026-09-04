-- recreate triggers from 006
drop trigger if exists check_holdings_before_insert_sell;

drop trigger if exists check_holdings_before_update_sell;

CREATE TRIGGER check_tx_invariant_after_insert AFTER INSERT ON transactions FOR EACH ROW BEGIN
SELECT
    CASE
        WHEN EXISTS (
            SELECT
                1
            FROM
                transactions_ext AS te
            WHERE
                te.asset_id = NEW.asset_id
                AND (
                    te.running_contribution IS NULL
                    OR te.running_contribution < 0
                )
        ) THEN RAISE (ABORT, 'TX_INVARIANT_VIOLATION')
    END;

END;

CREATE TRIGGER check_tx_invariant_after_update AFTER
UPDATE ON transactions FOR EACH ROW BEGIN
SELECT
    CASE
        WHEN EXISTS (
            SELECT
                1
            FROM
                transactions_ext AS te
            WHERE
                te.asset_id = NEW.asset_id
                AND (
                    te.running_contribution IS NULL
                    OR te.running_contribution < 0
                )
        )
        OR EXISTS (
            SELECT
                1
            FROM
                transactions_ext AS te
            WHERE
                te.asset_id = OLD.asset_id
                AND (
                    te.running_contribution IS NULL
                    OR te.running_contribution < 0
                )
        ) THEN RAISE (ABORT, 'TX_INVARIANT_VIOLATION')
    END;

END;

CREATE TRIGGER check_tx_invariant_after_delete AFTER DELETE ON transactions FOR EACH ROW BEGIN
SELECT
    CASE
        WHEN EXISTS (
            SELECT
                1
            FROM
                transactions_ext AS te
            WHERE
                te.asset_id = OLD.asset_id
                AND (
                    te.running_contribution IS NULL
                    OR te.running_contribution < 0
                )
        ) THEN RAISE (ABORT, 'TX_INVARIANT_VIOLATION')
    END;

END;