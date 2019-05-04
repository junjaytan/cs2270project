-- Create the table that provides metadata about anomaly detector thresholds

DROP TABLE IF EXISTS "anomaly_meta";

CREATE TABLE "anomaly_meta"(
	data_tablename VARCHAR PRIMARY KEY,
	ts_colname VARCHAR,
    threshold_colname VARCHAR,
	value_colname VARCHAR,
	threshold NUMERIC,  --ecg reading in millivolts
    comparator VARCHAR,  --string describing whether anomalies are above or below threshold
	ts_lag_colname VARCHAR DEFAULT NULL -- if populated, denotes the field that holds the lagging ts
);

--Note: threshold of 70 means about 2.2% of data points are anomalies
INSERT INTO anomaly_meta VALUES ('ecg_data', 'ecg_datetime', 'anomaly_likelihood', 'ecg_mv', 120, '>=');
-- note: current max value is 272.25
INSERT INTO anomaly_meta VALUES ('ecg_data_with_lag', 'ecg_datetime', 'anomaly_likelihood', 'ecg_mv', 120, '>=',
								 'ecg_datetime_prev');

INSERT INTO anomaly_meta VALUES ('sinewaves_data', 'my_datetime', 'sine1_value', 'sine2_value', 8.5, '>=');
