/**
 * Misc queries for benchmarking performance.
 */

SELECT segment_start_ts AS start_date, COUNT(*) as number_points,
json_agg(value_to_passthru ORDER BY cur_ts) AS ecg_mv
FROM filter_segments(NULL::public.ecg_data_with_lag,
                    'ecg_datetime', 'ecg_datetime_prev',
                    'anomaly_likelihood', 'ecg_mv', 120, 423)
GROUP BY segment_start_ts
ORDER BY number_points DESC
LIMIT 10;

SELECT COUNT(*) FROM ecg_data WHERE anomaly_likelihood >= 120 AND anomaly_likelihood <= 423;

--with preview, smaller range
SELECT segment_start_ts AS start_date, COUNT(*) as number_points,
json_agg(value_to_passthru ORDER BY cur_ts) AS ecg_mv
FROM filter_segments(NULL::public.ecg_data_with_lag,
                    'ecg_datetime', 'ecg_datetime_prev',
                    'anomaly_likelihood', 'ecg_mv', 100, 120)
GROUP BY segment_start_ts
ORDER BY number_points DESC
LIMIT 10;

SELECT COUNT(*) FROM ecg_data WHERE anomaly_likelihood >= 100 AND anomaly_likelihood <= 120;


--without preview
SELECT segment_start_ts AS start_date, COUNT(*) as number_points
FROM filter_segments(NULL::public.ecg_data_with_lag,
                    'ecg_datetime', 'ecg_datetime_prev',
                    'anomaly_likelihood', 'ecg_mv', 120, 423)
GROUP BY segment_start_ts
ORDER BY number_points DESC
LIMIT 10;

SELECT segment_start_ts AS start_date, COUNT(*) as number_points
FROM filter_segments(NULL::public.ecg_data_with_lag,
                    'ecg_datetime', 'ecg_datetime_prev',
                    'anomaly_likelihood', 'ecg_mv', 100, 120)
GROUP BY segment_start_ts
ORDER BY number_points DESC
LIMIT 10;




--Create ECG data table as a stock postgres table for comparison
DROP TABLE IF EXISTS "ecg_data_stockpg";

CREATE TABLE IF NOT EXISTS "ecg_data_stockpg"(
	ecg_datetime TIMESTAMP WITHOUT TIME ZONE PRIMARY KEY,
	ecg_mv NUMERIC NOT NULL,  --ecg reading in millivolts
	anomaly_likelihood NUMERIC
);

CREATE INDEX ON ecg_data_stockpg(ecg_mv);
CREATE INDEX ON ecg_data_stockpg(anomaly_likelihood);

\COPY ecg_data_stockpg FROM ecgsynlargedata_with_anomalies.csv CSV


DROP TABLE IF EXISTS "ecg_data_stockpg_with_lag";

CREATE TABLE IF NOT EXISTS "ecg_data_stockpg_with_lag"(
	ecg_datetime TIMESTAMP WITHOUT TIME ZONE PRIMARY KEY,
	ecg_datetime_prev TIMESTAMP WITHOUT TIME ZONE,  -- can be null
	ecg_mv NUMERIC NOT NULL,  --ecg reading in millivolts
	anomaly_likelihood NUMERIC
);

INSERT INTO ecg_data_stockpg_with_lag(ecg_datetime, ecg_datetime_prev, ecg_mv, anomaly_likelihood)
SELECT ecg_datetime, LAG(ecg_datetime) OVER (ORDER BY ecg_datetime)
AS prev_row_datetime, ecg_mv, anomaly_likelihood FROM ecg_data_stockpg;

CREATE INDEX ON ecg_data_stockpg_with_lag(ecg_datetime);
CREATE INDEX ON ecg_data_stockpg_with_lag(ecg_mv);
CREATE INDEX ON ecg_data_stockpg_with_lag(anomaly_likelihood);



-- For measuring window autosample performance
-- 1 hr
SELECT * FROM window_autosample(NULL::ecg_data100, 'ecg_datetime',
'ecg_mv', '2018-02-01 12:00:00', '2018-02-01 13:00:00', 1000, 300);

-- 1 day
SELECT * FROM window_autosample(NULL::ecg_data100, 'ecg_datetime',
'ecg_mv', '2018-02-01 12:00:00', '2018-02-02 12:00:00', 1000, 300);

-- 2 days
SELECT * FROM window_autosample(NULL::ecg_data100, 'ecg_datetime',
'ecg_mv', '2018-02-01 12:00:00', '2018-02-03 12:00:00', 1000, 300);

-- 3 days
SELECT * FROM window_autosample(NULL::ecg_data100, 'ecg_datetime',
'ecg_mv', '2018-02-01 12:00:00', '2018-02-04 12:00:00', 1000, 300);

-- 1 week
SELECT * FROM window_autosample(NULL::ecg_data100, 'ecg_datetime',
'ecg_mv', '2018-02-01 12:00:00', '2018-02-08 12:00:00', 1000, 300);

--1 month
SELECT * FROM window_autosample(NULL::ecg_data100, 'ecg_datetime',
'ecg_mv', '2018-02-01 12:00:00', '2018-03-01 12:00:00', 1000, 300);


/* clearing system caches: use the following commands
# page cache only
sync; echo 1 > /proc/sys/vm/drop_caches

# clear dentries and inodes
sync; echo 2 > /proc/sys/vm/drop_caches

# Clear PageCache, dentries and inodes.
sync; echo 3 > /proc/sys/vm/drop_caches

*/