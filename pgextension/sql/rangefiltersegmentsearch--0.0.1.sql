-- complain if script is sourced in psql, rather than via CREATE EXTENSION
\echo Use "CREATE EXTENSION rangefiltersegmentsearch" to load this file. \quit

CREATE or REPLACE FUNCTION segment_range(ts TIMESTAMP) RETURNS TIMESTAMP
AS '$libdir/rangefiltersegmentsearch'
LANGUAGE C IMMUTABLE STRICT;