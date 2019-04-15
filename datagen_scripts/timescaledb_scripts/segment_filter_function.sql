/*
 * Misc scripts describing development and
 * through process for plpgsql segment_filter function
*/

--Basically, we want to get a query output similar to the following
-- that, for each record, lets us know the timestamp of the previous
-- record directly before it (assume no duplicate timestamps)
-- and then filtering on that set. We can then iterate over the rows
-- via plpgsql so consecutive points are labeled as the same segment
-- (via the same segment start time)
SELECT *
FROM (
  SELECT *, lag(my_datetime) OVER (ORDER BY my_datetime) AS prev_row_datetime 
  FROM sinewaves_data
) AS data_with_prev_rowtime
WHERE sine1_value < 10 AND sine1_value > 8.5 
ORDER BY my_datetime
LIMIT 10;


-- A function that performs this but is missing the filter
-- is as follows
-- Note that plpgsql requires us to pre-specify the return types
-- so we might want an overloaded function that accepts another
-- numeric field that contains the raw time-series data (as opposed
-- to the numeric field representing spectral power, AD likelihoods, etc
-- that we are filtering on)
CREATE OR REPLACE FUNCTION filter_segments(_tbl ANYELEMENT, datecol TEXT, 
valuecol_to_filter TEXT, min_value NUMERIC, max_value NUMERIC)
  RETURNS TABLE (cur_ts TIMESTAMP, prev_row_ts TIMESTAMP, value_to_filter NUMERIC) AS
$$
BEGIN
RETURN QUERY EXECUTE 
format('SELECT * FROM (SELECT %s, LAG(%s) OVER (ORDER BY %s)'
' as prev_row_datetime, %s FROM %s) AS data_with_prev_rowtime '
'WHERE %s >= %s AND %s <= %s',
datecol, datecol, datecol, valuecol_to_filter, pg_typeof(_tbl),
valuecol_to_filter, min_value, valuecol_to_filter, max_value);
END
$$  LANGUAGE plpgsql;

-- This function can be run as follows
SELECT * FROM 
filter_segments(NULL::public.sinewaves_data, 'my_datetime', 'sine1_value', 8.5, 10) 
LIMIT 10;

-- We can delete the function with this command
DROP FUNCTION filter_segments;