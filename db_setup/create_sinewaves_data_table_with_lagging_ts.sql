--Script to create tables and load sinewaves data into timespandb

DROP TABLE IF EXISTS "sinewaves_data_with_lag";

CREATE TABLE IF NOT EXISTS "sinewaves_data_with_lag"(
	my_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	my_datetime_prev TIMESTAMP WITHOUT TIME ZONE,
	sine1_value NUMERIC,  -- use this as the detector output
	sine2_value NUMERIC
);

SELECT create_hypertable('sinewaves_data_with_lag', 'my_datetime');

INSERT INTO sinewaves_data_with_lag(my_datetime, my_datetime_prev, sine1_value, sine2_value)
SELECT my_datetime, LAG(my_datetime) OVER (ORDER BY my_datetime)
AS my_datetime_prev, sine1_value, sine2_value FROM sinewaves_data;

CREATE INDEX ON sinewaves_data_with_lag(sine1_value);
CREATE INDEX ON sinewaves_data_with_lag(sine2_value);
