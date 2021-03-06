/**
 * Basic tests to verify that filter segment (with an additional
 * passthrough field) works for table where prev timestamp is
 * provided as an additional materialized table column.
 */
 BEGIN;
CREATE TABLE IF NOT EXISTS "filtersegments_test"(
	ecg_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	ecg_datetime_prev TIMESTAMP WITHOUT TIME ZONE,  -- can be null
	ecg_mv NUMERIC NOT NULL,  --ecg reading in millivolts
	anomaly_likelihood NUMERIC
);
INSERT INTO filtersegments_test(ecg_datetime, ecg_datetime_prev, ecg_mv, anomaly_likelihood)
VALUES ('2018-01-01 00:00:00', NULL, 4, 5),
('2018-01-01 00:01:00', '2018-01-01 00:00:00', 3.5, 6),
('2018-01-01 00:02:00', '2018-01-01 00:01:00', 2.5, 7),
('2018-01-01 00:03:00', '2018-01-01 00:02:00', 3.5, 2),
('2018-01-01 00:05:00', '2018-01-01 00:03:00', 4.5, 6),
('2018-01-01 00:06:00', '2018-01-01 00:05:00', 1.2, 8),
('2018-01-01 00:07:00', '2018-01-01 00:06:00', 1.2, 9);

SELECT segment_start_ts, MAX(cur_ts) AS segment_end_ts,
COUNT(*) AS number_points,
json_agg(value_to_passthru ORDER BY cur_ts) AS json_data
FROM filter_segments(NULL::filtersegments_test, 'ecg_datetime',
'ecg_datetime_prev',
'anomaly_likelihood', 'ecg_mv', 6, 9)
GROUP BY segment_start_ts
ORDER BY segment_start_ts DESC
LIMIT 10;

--A slightly more restricted filter
SELECT segment_start_ts, MAX(cur_ts) AS segment_end_ts,
COUNT(*) AS number_points,
json_agg(value_to_passthru ORDER BY cur_ts) AS json_data
FROM filter_segments(NULL::filtersegments_test, 'ecg_datetime',
'ecg_datetime_prev',
'anomaly_likelihood', 'ecg_mv', 6, 8)
GROUP BY segment_start_ts
ORDER BY segment_start_ts DESC
LIMIT 10;

-- This encompasses all points, to test that the edge case of
-- first point (with null lag) works
SELECT segment_start_ts, MAX(cur_ts) AS segment_end_ts,
COUNT(*) AS number_points,
json_agg(value_to_passthru ORDER BY cur_ts) AS json_data
FROM filter_segments(NULL::filtersegments_test, 'ecg_datetime',
'ecg_datetime_prev',
'anomaly_likelihood', 'ecg_mv', 0, 10)
GROUP BY segment_start_ts
ORDER BY segment_start_ts DESC
LIMIT 10;

ROLLBACK;