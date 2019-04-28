-- complain if script is sourced in psql, rather than via CREATE EXTENSION
\echo Use "CREATE EXTENSION rangefiltersegmentsearch" to load this file. \quit

-- Toy example c function that just returns the same field value
CREATE or REPLACE FUNCTION segment_range(ts TIMESTAMP) RETURNS TIMESTAMP
AS '$libdir/rangefiltersegmentsearch'
LANGUAGE C IMMUTABLE STRICT;

-- Toy example of a plpgsql routine that calls another
-- c routine in this same extension
CREATE OR REPLACE FUNCTION segment_range_wrapper(ts TIMESTAMP) RETURNS TIMESTAMP AS
$$
BEGIN
  RETURN segment_range(ts);
END;
$$ LANGUAGE plpgsql;

-- Just an experimental c function testing how to return tuples given an input tbl
CREATE OR REPLACE FUNCTION filter_segments_beta(tblname TEXT)
  RETURNS SETOF TIMESTAMP
AS '$libdir/filtersegments'
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
$$ LANGUAGE plpgsql;


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