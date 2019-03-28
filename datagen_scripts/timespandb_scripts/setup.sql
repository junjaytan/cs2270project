--Preliminary setup to create database to hold the synthetic data
CREATE DATABASE testdata;

\c testdata

--You can verify whether the timescaledb extension is enabled with: \dx
--If not, run:
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;


