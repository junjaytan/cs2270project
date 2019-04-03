# Datagen scripts

Misc scripts for generating synthetic test data. This data can then mimic a temporal range-based query in stock timescaleDB using the sql scripts in the subdirectory.

The two scripts are

* `ascending_value_by_time.py`: This is merely for ensuring that queries return the desired order. Best to use the sine waves script for testing.
* `sine_waves.py`: Generate two sine waves (one offset from the other) that can be used to run a primitive temporal range query. One sine wave can be used analogously to an output we want to filter on (e.g., anomaly detector raw likelihood values, spectogram values), while the other sine wave can be thought of as the "raw" signal we want to visualize.
