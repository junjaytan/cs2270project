-- complain if script is sourced in psql, rather than via CREATE EXTENSION
\echo Use "CREATE EXTENSION rangefiltersegmentsearch" to load this file. \quit

CREATE or REPLACE FUNCTION segment_range(ts TIMESTAMP) RETURNS TIMESTAMP
AS '$libdir/rangefiltersegmentsearch'
LANGUAGE C IMMUTABLE STRICT;


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
                 prev_row_ts TIMESTAMP, value_to_filter NUMERIC,
                 value_to_passthru NUMERIC) AS
$$
DECLARE
  -- This is a temp variable we use to store as we iterate
  loop_previous_cur_ts TIMESTAMP := NULL;
BEGIN
  FOR cur_ts, prev_row_ts, value_to_filter, value_to_passthru IN
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


-- This is a much faster function to run if you have a table where each
-- row contains the previous timestamp appended as an additional column
-- If you use this, you should also create an update rule to update
-- that column appropriately.
CREATE OR REPLACE FUNCTION filter_segments(_tbl ANYELEMENT, datecol TEXT, prev_datecol TEXT,
valuecol_to_filter TEXT, valuecol_to_passthru TEXT,
min_value NUMERIC, max_value NUMERIC)
  RETURNS TABLE (segment_start_ts TIMESTAMP, cur_ts TIMESTAMP,
                 prev_row_ts TIMESTAMP, value_to_filter NUMERIC,
                 value_to_passthru NUMERIC) AS
$$
DECLARE
  -- This is a temp variable we use to store as we iterate
  loop_previous_cur_ts TIMESTAMP := NULL;
BEGIN
  FOR cur_ts, prev_row_ts, value_to_filter, value_to_passthru IN
  EXECUTE
    format('SELECT %s, %s, %s, %s FROM %s WHERE %s >= %s AND %s <= %s ORDER BY %s',
           datecol, prev_datecol, valuecol_to_filter, valuecol_to_passthru,
	   pg_typeof(_tbl), valuecol_to_filter, min_value, valuecol_to_filter, max_value,
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

-- Overloaded function that uses an additional column holding previous timestamp
-- to prefilter based on a date range. Note that a table that has no previous timestamp
-- would not benefit from date filtering because we would need the entire data
-- to generate the lagging timestamps anyway.
CREATE OR REPLACE FUNCTION filter_segments(_tbl ANYELEMENT, datecol TEXT, prev_datecol TEXT,
start_ts TIMESTAMP, end_ts TIMESTAMP,
valuecol_to_filter TEXT, valuecol_to_passthru TEXT,
min_value NUMERIC, max_value NUMERIC)
  RETURNS TABLE (segment_start_ts TIMESTAMP, cur_ts TIMESTAMP,
                 prev_row_ts TIMESTAMP, value_to_filter NUMERIC,
                 value_to_passthru NUMERIC) AS
$$
DECLARE
  -- This is a temp variable we use to store as we iterate
  loop_previous_cur_ts TIMESTAMP := NULL;
BEGIN
  FOR cur_ts, prev_row_ts, value_to_filter, value_to_passthru IN
  EXECUTE
    format('SELECT %s, %s, %s, %s FROM %s WHERE %s >= %s AND %s <= %s AND %s <= ''%s'' '
          'AND %s >= ''%s'' ORDER BY %s',
           datecol, prev_datecol, valuecol_to_filter, valuecol_to_passthru,
	   pg_typeof(_tbl), valuecol_to_filter, min_value, valuecol_to_filter, max_value,
           datecol, end_ts, datecol, start_ts, datecol)
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


-- This performs a sampled window operation using the average value
CREATE OR REPLACE FUNCTION window_autosample(_tbl ANYELEMENT, datecol TEXT,
valuecol_to_passthru TEXT, start_ts TIMESTAMP, end_ts TIMESTAMP, res_width INT,
res_height INT)
  RETURNS TABLE (sampled_ts TIMESTAMP, sampled_value NUMERIC) AS
$$
DECLARE
  -- This is a temp variable we use to store as we iterate
  loop_previous_cur_ts TIMESTAMP := NULL;
  entries INT;
  max_points INT := 4 * res_width;  --Some factor of the width
  datediff_secs BIGINT;
  bucketsize_secs BIGINT;
BEGIN
  EXECUTE format('SELECT COUNT(*) FROM %s WHERE %s >= ''%s'' AND %s <= ''%s''',
                pg_typeof(_tbl), datecol, start_ts, datecol, end_ts) into entries;
  IF entries <= max_points THEN
     RETURN QUERY EXECUTE format('SELECT %s AS ts_datetime, %s FROM %s WHERE %s >= ''%s'' AND %s <= ''%s''',
                datecol, valuecol_to_passthru, pg_typeof(_tbl), datecol, start_ts, datecol, end_ts);
  ELSE
    SELECT EXTRACT(EPOCH FROM end_ts) - EXTRACT(EPOCH FROM start_ts) INTO datediff_secs;
    bucketsize_secs = datediff_secs / max_points;
    RETURN QUERY EXECUTE format('SELECT time_bucket(''%s seconds'', %s) AS ts_datetime, AVG(%s) AS %s FROM %s '
                                'WHERE %s >= ''%s'' AND %s <= ''%s'' '
                                'GROUP BY ts_datetime ORDER BY ts_datetime',
                                bucketsize_secs, datecol, valuecol_to_passthru, valuecol_to_passthru,
                                pg_typeof(_tbl), datecol, start_ts, datecol, end_ts);
  END IF;
END
$$  LANGUAGE plpgsql;

-- Same as above, but passing through two columns
CREATE OR REPLACE FUNCTION window_autosample(_tbl ANYELEMENT, datecol TEXT,
valuecol_to_passthru TEXT, valuecol_to_passthru2 TEXT, start_ts TIMESTAMP, end_ts TIMESTAMP, res_width INT,
res_height INT)
  RETURNS TABLE (sampled_ts TIMESTAMP, sampled_value NUMERIC, sampled_value2 NUMERIC) AS
$$
DECLARE
  -- This is a temp variable we use to store as we iterate
  loop_previous_cur_ts TIMESTAMP := NULL;
  entries INT;
  max_points INT := 4 * res_width;  --Some factor of the width
  datediff_secs BIGINT;
  bucketsize_secs BIGINT;
BEGIN
  EXECUTE format('SELECT COUNT(*) FROM %s WHERE %s >= ''%s'' AND %s <= ''%s''',
                pg_typeof(_tbl), datecol, start_ts, datecol, end_ts) into entries;
  IF entries <= max_points THEN
     RETURN QUERY EXECUTE format('SELECT %s AS ts_datetime, %s, %s FROM %s WHERE %s >= ''%s'' AND %s <= ''%s''',
                datecol, valuecol_to_passthru, valuecol_to_passthru2, pg_typeof(_tbl), datecol, start_ts, datecol, end_ts);
  ELSE
    SELECT EXTRACT(EPOCH FROM end_ts) - EXTRACT(EPOCH FROM start_ts) INTO datediff_secs;
    bucketsize_secs = datediff_secs / max_points;
    RETURN QUERY EXECUTE format('SELECT time_bucket(''%s seconds'', %s) AS ts_datetime, AVG(%s) AS %s, '
                                'AVG(%s) AS %s FROM %s '
                                'WHERE %s >= ''%s'' AND %s <= ''%s'' '
                                'GROUP BY ts_datetime ORDER BY ts_datetime',
                                bucketsize_secs, datecol, valuecol_to_passthru, valuecol_to_passthru,
                                valuecol_to_passthru2, valuecol_to_passthru2,
                                pg_typeof(_tbl), datecol, start_ts, datecol, end_ts);
  END IF;
END
$$  LANGUAGE plpgsql;