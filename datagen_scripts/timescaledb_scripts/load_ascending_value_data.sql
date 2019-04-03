--Script to create tables and load ascending value data into timespandb

DROP TABLE IF EXISTS "data_increasing_by_time";

CREATE TABLE IF NOT EXISTS "data_increasing_by_time"(
	my_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	value NUMERIC
);

SELECT create_hypertable('data_increasing_by_time', 'my_datetime');

/*
--To load data, run something similar to this command
psql -U postgres -d testdata -h localhost -c "\COPY data_increasing_by_time FROM incrementing_values.csv CSV HEADER"
*/
