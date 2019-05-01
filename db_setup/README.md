# Postgres/TimescaleDB Data Setup Scripts

This readme and directory contains instrutions for setting up your database in
 a state that's ready to run the segment filter search demo.

 ## Postgres Installation and TimescaleDB setup

 See the instructions in the [timescaleDB setup readme](../datagen_scripts/timescaledb_scripts/README.md). We are testing on Postgres 11, so please use that version.

 ## Data for Database

 We will be using several synthetic data sets. These can be generated using scripts as described below, or easier yet, just download the already generated ones as linked in the next section.

 * A large ECG dataset (1GB+ uncompressed). Data is "captured" uniformly at 1 second intervals, and there is a raw signal field called `ecg_mv` signifying the ECG readings in millivolts (with minor noise) and a raw value output by a synthetic anomaly detector, called `anomaly_likelihood`.
   * This data was generated using ECGSYN in ~1.1GB chunks, then anomalies were added using a python script taht folds segments on each other. See the folder and readme relative to the repo root at [`datagen_scripts/ecgsyn`](../datagen_scripts/ecgsyn) for more details.
 * A small sinewave dataset (~25MB uncompressed), where the raw signal and the anomaly detector likelihood are both represented by sine waves. The two sine waves have different amplitudes and are slightly offset from each other.
   * The script for generating this data is in this repo relative to the root at [`datagen_scripts/sine_waves.py`](../datagen_scripts/sine_waves.py)

## Initializing Database Tables and Data

* Create a database called `ecgdb` that will house all your data (you can name it something different, but the UI currently defaults to connecting to this db as user `postgres` at `localhost`).
* Initialize tables to hold the ECG data (without an appended column that holds the lagging timestamp; this will be generated later) and the sinewaves data, then load the CSV data.
  * ECG data:
   * run `create_ecg_table.sql` to initialize table.
   * Download the csv data from the shared [google drive folder](https://drive.google.com/drive/folders/1pXt_lYOTEgFAQQw1gU8YpEOUMrrfFa7G?usp=sharing) and load it to the table using the commented command in the script above.
     * Note that there are two datasets here. The second one continues in time from the first one. You can just load the first dataset. We can add the second one if we want to simulate a larger DB.
  * Sinewaves data:
    * run `create_sinewaves_data_table.sql` to initialize table.
    * Download the csv data from the shared google drive folder mentioned previously, and load it to the table using the commented command in the script above.
* Now that the ecg data table is loaded, we will create an additional ECG data table that contains the lagging (previous) timestamp for each point appended as an additional column. Having this will allow the segment search to run much faster.
  * Run `create_ecg_table_with_lagging_ts.sql`
* Finally, we will create the metadata table that the app will use to know which data tables to reference and likelihood thresholds to use.

## Add Extension

Now you will need to add the extension to provide the `filter_segments()` function.

* Go to (relative to repo root) `pgextension/` and run `make` followed by `make install` to load the shared library into postgres.
* Then add the extension while logged into the `ecgdb` database: `CREATE EXTENSION rangefiltersegmentsearch;`
* Note that there are several overloaded variants of the `filter_segments()` function, so run the appropriate one based on what you need:
  * `filter_segments(TABLENAME, DATETIME_COL_NAME, VALUE_TO_FILTER_COL_NAME)`: Only returns timestamp column and the anomaly detector column (which is the one used for filtering).
  * `filter_segments(TABLENAME, DATETIME_COL_NAME, VALUE_TO_FILTER_COL_NAME, VALUE_TO_PASSTHRU_COLN_NAME)`: Returns an additional column representing another numerical field, typically the raw signal values.
    * Example query:
      * ```SQL
        SELECT segment_start_ts, MAX(cur_ts) AS segment_end_ts,
        json_agg(value_to_passthru ORDER BY cur_ts) AS json_data,
        COUNT(*) AS number_points
        FROM filter_segments(NULL::ecg_data, 'ecg_datetime', 'anomaly_likelihood', 'ecg_mv', 78, 300)
        GROUP BY segment_start_ts
        ORDER BY number_points DESC
        LIMIT 10;
        ```
  * `filter_segments(TABLENAME, DATETIME_COL_NAME, PREVIOUS_DATETIME_COL_NAME, VALUE_TO_FILTER_COL_NAME, VALUE_TO_PASSTHRU_COLN_NAME)`: uses the additional lagging timestamp column to run a much faster segment filter search.
    * Example query:
      * ```SQL
        SELECT *
        FROM filter_segments(NULL::public.ecg_data_with_lag, 'ecg_datetime', 'ecg_datetime_prev', 'anomaly_likelihood', 'ecg_mv', 78, 300) LIMIT 10;
        ```
  * `filter_segments(TABLENAME, DATETIME_COL_NAME, PREVIOUS_DATETIME_COL_NAME, START_DATE, END_DATE VALUE_TO_FILTER_COL_NAME, VALUE_TO_PASSTHRU_COLN_NAME)`: uses the additional lagging timestamp column along with a date range filter to run an even faster segment filter search depending on your time range.
    * Example query:
      * ```SQL
        SELECT *
        FROM filter_segments(NULL::public.ecg_data_with_lag, 'ecg_datetime', 'ecg_datetime_prev', '2018-07-01 12:00:00', '2019-01-12', 'anomaly_likelihood', 'ecg_mv', 78, 300) LIMIT 10;
        ```