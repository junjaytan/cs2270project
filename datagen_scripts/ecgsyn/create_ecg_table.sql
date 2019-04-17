-- Create data to store synthetic ECG data with anomalies

DROP TABLE IF EXISTS "ecg_data";

CREATE TABLE IF NOT EXISTS "ecg_data"(
	ecg_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	ecg_mv NUMERIC NOT NULL,  --ecg reading in millivolts
	anomaly_likelihood NUMERIC
);

SELECT create_hypertable('ecg_data', 'ecg_datetime');

CREATE INDEX ON ecg_data(ecg_mv);
CREATE INDEX ON ecg_data(anomaly_likelihood);

/*
--To load data, run something similar to this command
psql -U postgres -d ecgdb -h localhost -c "\COPY ecg_data FROM ecgsynlargedata_with_anomalies.csv CSV"
*/
