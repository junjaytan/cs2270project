-- Create the table that provides metadata about anomaly detector thresholds

DROP TABLE IF EXISTS "anomaly_meta";

CREATE TABLE IF NOT EXISTS "anomaly_meta"(
	data_tablename VARCHAR,
	ts_colname VARCHAR,
    	threshold_colname VARCHAR,
	value_colname VARCHAR,
	threshold NUMERIC,  --ecg reading in millivolts
    	comparator VARCHAR  --string describing whether anomalies are above or below threshold
);

--Note: threshold of 70 means about 2.2% of data points are anomalies
INSERT INTO anomaly_meta VALUES ('ecg_data', 'ecg_datetime', 'anomaly_likelihood', 'ecg_mv', 78, 'greater_than');
-- note: current max value is 272.25
