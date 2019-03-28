/*
This is an initial implementation of a range based value filter
for windows on TimescaleDB that utilizes materialized temp tables.

It assumes that rows are unique by timestamp. However, the query
could also work if this condition does not hold but we 
would need to add an additional filter towards then end to ensure
that the values returned in the window only include rows that match 
the filter, since currently we first find time spans that match the 
filter, and then return all the data in those time ranges.


TODO: try different indexing schemes and see how much
that improves performance in stock TimespanDB.

To run and time this script, run command: >>
time psql -h localhost -d testdata -U postgres -f range_based_window_filter_query_using_temp_tables.sql
*/


/**
Create a temp table that, for each entry, identifies if that element, its
previous element (by time), and its next element (by time) are within 
the filter. This will be used later to determine start and stop ranges for
each window.

NOte: this will miss the first and last records, but we'll assume that's ok.
*/
DROP TABLE IF EXISTS sinewaves_temp1 CASCADE;
CREATE TABLE sinewaves_temp1 AS
WITH filtered AS(
SELECT ROW_NUMBER() OVER(ORDER BY my_datetime) as sequence_idx, my_datetime,
(CASE WHEN sine1_value < 10 AND sine1_value > 8.5 THEN TRUE ELSE FALSE END) AS in_filter 
FROM sinewaves_data)
SELECT filtered.sequence_idx, filtered.my_datetime, filtered.in_filter, filteredprev.in_filter as prev_in_filter, 
--filteredprev.my_datetime as prev_datetime,
filterednext.in_filter as next_in_filter
--, filterednext.my_datetime as next_datetime
FROM filtered INNER JOIN filtered AS filteredprev ON filtered.sequence_idx=filteredprev.sequence_idx+1
INNER JOIN filtered as filterednext ON filtered.sequence_idx=filterednext.sequence_idx-1;

-- Identify all starts of windows that meet filter
DROP TABLE IF EXISTS sinewaves_range_starts_temp CASCADE;
CREATE TABLE sinewaves_range_starts_temp AS
SELECT my_datetime, in_filter, prev_in_filter
FROM sinewaves_temp1
WHERE in_filter AND prev_in_filter=FALSE;

-- Identify all ends of windows that meet filter
DROP TABLE IF EXISTS sinewaves_range_ends_temp CASCADE;
CREATE TABLE sinewaves_range_ends_temp AS
SELECT my_datetime, in_filter, next_in_filter
FROM sinewaves_temp1
WHERE in_filter AND next_in_filter=FALSE;


-- Now combie the range start and range end tables to 
-- get the ranges organized into two columns.
DROP TABLE IF EXISTS sinewaves_matching_ranges_temp CASCADE;
CREATE TABLE sinewaves_matching_ranges_temp AS
SELECT start_date, MIN(possible_end_date) as end_date
FROM
(
SELECT range_start.my_datetime as start_date, range_end.my_datetime AS possible_end_date
FROM sinewaves_range_starts_temp as range_start, 
sinewaves_range_ends_temp AS range_end
WHERE range_start.my_datetime <= range_end.my_datetime) AS cross_joined_dates
GROUP BY start_date;


-- Finally, query to return the data in a json array based on some top-k
-- condition
SELECT start_date, end_date, json_agg(sine1_value ORDER BY my_datetime)
FROM sinewaves_matching_ranges_temp, sinewaves_data
WHERE sinewaves_data.my_datetime >=start_date AND sinewaves_data.my_datetime <= end_date
GROUP BY start_date, end_date
ORDER BY end_date DESC
LIMIT 10;

/*
--DROP ALL TEMP TABLES
DROP TABLE sinewaves_matching_ranges_temp CASCADE;
DROP TABLE sinewaves_range_starts_temp CASCADE;
DROP TABLE sinewaves_range_ends_temp CASCADE;
DROP TABLE sinewaves_temp1 CASCADE;
*/