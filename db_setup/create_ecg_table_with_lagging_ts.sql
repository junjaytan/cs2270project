-- Create an ECG data table additional field with lag
-- Note that your data should already be loaded in the ecg_data table.
DROP TABLE IF EXISTS "ecg_data_with_lag";

CREATE TABLE IF NOT EXISTS "ecg_data_with_lag"(
	ecg_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	ecg_datetime_prev TIMESTAMP WITHOUT TIME ZONE,  -- can be null
	ecg_mv NUMERIC NOT NULL,  --ecg reading in millivolts
	anomaly_likelihood NUMERIC
);

SELECT create_hypertable('ecg_data_with_lag', 'ecg_datetime');

INSERT INTO ecg_data_with_lag(ecg_datetime, ecg_datetime_prev, ecg_mv, anomaly_likelihood)
SELECT ecg_datetime, LAG(ecg_datetime) OVER (ORDER BY ecg_datetime)
AS prev_row_datetime, ecg_mv, anomaly_likelihood FROM ecg_data;

CREATE INDEX ON ecg_data_with_lag(ecg_mv);
CREATE INDEX ON ecg_data_with_lag(anomaly_likelihood);