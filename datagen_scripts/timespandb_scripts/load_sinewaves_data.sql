--Script to create tables and load sinewaves data into timespandb

DROP TABLE IF EXISTS "sinewaves_data";

CREATE TABLE IF NOT EXISTS "sinewaves_data"(
	my_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	sine1_value NUMERIC,
	sine2_value NUMERIC
);

SELECT create_hypertable('sinewaves_data', 'my_datetime');

/*
--To load data, run something similar to this command
psql -U postgres -d testdata -h localhost -c "\COPY sinewaves_data FROM sine_waves_data.csv CSV HEADER"
*/
