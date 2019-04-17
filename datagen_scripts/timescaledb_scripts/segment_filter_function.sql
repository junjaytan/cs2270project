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


-- A function that performs this and only passes through the 
-- filtered value field (e.g., the detector's raw values)
-- Note that plpgsql requires us to pre-specify the return types
-- so we might want an overloaded function that accepts another
-- numeric field that contains the raw time-series data (as opposed
-- to the numeric field representing spectral power, AD likelihoods, etc
-- that we are filtering on)
CREATE OR REPLACE FUNCTION filter_segments(_tbl ANYELEMENT, datecol TEXT, 
valuecol_to_filter TEXT, min_value NUMERIC, max_value NUMERIC)
  RETURNS TABLE (segment_start_ts TIMESTAMP, cur_ts TIMESTAMP, 
                 prev_row_ts TIMESTAMP, value_to_filter NUMERIC) AS
$$
DECLARE
  -- This is a temp variable we use to store as we iterate
  loop_previous_cur_ts TIMESTAMP := NULL;
  --segment_start_ts TIMESTAMP := NULL;
BEGIN
  FOR cur_ts, prev_row_ts, value_to_filter IN 
  EXECUTE 
    format('SELECT * FROM (SELECT %s, LAG(%s) OVER (ORDER BY %s)'
           ' as prev_row_datetime, %s FROM %s) AS data_with_prev_rowtime '
           'WHERE %s >= %s AND %s <= %s ORDER BY %s',
           datecol, datecol, datecol, valuecol_to_filter, pg_typeof(_tbl),
           valuecol_to_filter, min_value, valuecol_to_filter, max_value,
           datecol)
    LOOP
      -- First timestamp in all time!
      IF prev_row_ts IS NULL THEN 
        segment_start_ts := cur_ts;
        loop_previous_cur_ts := cur_ts;
      ELSE
        -- if we've not yet populated the temp var for previous row's cur_ts
        IF loop_previous_cur_ts IS NULL THEN
          -- This is the first segment we've encountered
          segment_start_ts := cur_ts;
          loop_previous_cur_ts := cur_ts;
        ELSIF prev_row_ts = loop_previous_cur_ts THEN
          -- Is a continuation of previous segment!
          loop_previous_cur_ts := cur_ts;
        ELSE
          -- Is a new segment because there are points not in the filter range
          -- between this and the previous value in the filter range
          segment_start_ts := cur_ts;
          loop_previous_cur_ts := cur_ts;
        END IF;
      END IF;
      RETURN NEXT;
    END LOOP;
END
$$  LANGUAGE plpgsql;


-- Same as above, but overloaded to pass through a second
-- numeric field, which is typically the raw sigal that will
-- be plotted.
CREATE OR REPLACE FUNCTION filter_segments(_tbl ANYELEMENT, datecol TEXT, 
valuecol_to_filter TEXT, valuecol_to_passthru TEXT, 
min_value NUMERIC, max_value NUMERIC)
  RETURNS TABLE (segment_start_ts TIMESTAMP, cur_ts TIMESTAMP, 
                 prev_row_ts TIMESTAMP, value_to_filter NUMERIC) AS
$$
DECLARE
  -- This is a temp variable we use to store as we iterate
  loop_previous_cur_ts TIMESTAMP := NULL;
  --segment_start_ts TIMESTAMP := NULL;
BEGIN
  FOR cur_ts, prev_row_ts, value_to_filter, valuecol_to_passthru IN 
  EXECUTE 
    format('SELECT * FROM (SELECT %s, LAG(%s) OVER (ORDER BY %s)'
           ' as prev_row_datetime, %s, %s FROM %s) AS data_with_prev_rowtime '
           'WHERE %s >= %s AND %s <= %s ORDER BY %s',
           datecol, datecol, datecol, valuecol_to_filter, 
           valuecol_to_passthru,
           pg_typeof(_tbl),
           valuecol_to_filter, min_value, valuecol_to_filter, max_value,
           datecol)
    LOOP
      -- First timestamp in all time!
      IF prev_row_ts IS NULL THEN 
        segment_start_ts := cur_ts;
        loop_previous_cur_ts := cur_ts;
      ELSE
        -- if we've not yet populated the temp var for previous row's cur_ts
        IF loop_previous_cur_ts IS NULL THEN
          -- This is the first segment we've encountered
          segment_start_ts := cur_ts;
          loop_previous_cur_ts := cur_ts;
        ELSIF prev_row_ts = loop_previous_cur_ts THEN
          -- Is a continuation of previous segment!
          loop_previous_cur_ts := cur_ts;
        ELSE
          -- Is a new segment because there are points not in the filter range
          -- between this and the previous value in the filter range
          segment_start_ts := cur_ts;
          loop_previous_cur_ts := cur_ts;
        END IF;
      END IF;
      RETURN NEXT;
    END LOOP;
END
$$  LANGUAGE plpgsql;


-- This function can be run as follows
SELECT * FROM 
filter_segments(NULL::public.ecg_data, 'ecg_datetime', 'anomaly_likelihood', 78, 300) 
LIMIT 50;

-- or if we also want to pass through the raw signal
SELECT * FROM 
filter_segments(
  NULL::public.ecg_data, 'ecg_datetime', 'anomaly_likelihood', 'ecg_mv', 
  78, 300) 
LIMIT 50;

-- Finally, query to return the data in a json array based on some top-k
-- condition
SELECT segment_start_ts, MAX(cur_ts) AS segment_end_ts, 
COUNT(*) AS number_points,
json_agg(value_to_filter ORDER BY cur_ts) AS json_data
FROM filter_segments(NULL::public.ecg_data, 'ecg_datetime', 'anomaly_likelihood', 78, 300) 
GROUP BY segment_start_ts
ORDER BY number_points DESC -- segment_end_ts, AVG(value_to_filter) DESC
LIMIT 10;

-- We can delete the function with this command
DROP FUNCTION filter_segments(ANYELEMENT, TEXT, TEXT, NUMERIC, NUMERIC);
DROP FUNCTION filter_segments(ANYELEMENT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC);

/**
-- Some other useful code for reference

--Example of looping on each row.
CREATE OR REPLACE FUNCTION testfunc(_tbl ANYELEMENT)
  RETURNS SETOF ANYELEMENT AS
$$
DECLARE
	row_data record;
BEGIN
  FOR row_data IN EXECUTE format('SELECT * FROM %s', pg_typeof(_tbl))
  LOOP
    RETURN NEXT row_data;
  END LOOP;
END;

SELECT * FROM testfunc(NULL::public.sinewaves_data) LIMIT 10;


*/