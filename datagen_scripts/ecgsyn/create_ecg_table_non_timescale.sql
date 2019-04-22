-- Create data to store synthetic ECG data with anomalies
-- as a standard postgres table for comparing performance
-- with timescaledb hypertable variant

DROP TABLE IF EXISTS "ecg_data_nontimescale";

CREATE TABLE IF NOT EXISTS "ecg_data_nontimescale"(
	ecg_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	ecg_mv NUMERIC NOT NULL,  --ecg reading in millivolts
	anomaly_likelihood NUMERIC
);

CREATE INDEX ON ecg_data_nontimescale(ecg_mv);
CREATE INDEX ON ecg_data_nontimescale(anomaly_likelihood);

/*
--To load data, run something similar to this command
psql -U postgres -d ecgdb -h localhost -c "\COPY ecg_data_nontimescale FROM ecgsynlargedata_with_anomalies.csv CSV"
*/
