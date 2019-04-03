# TimescaleDB Test Scripts

These scripts can be used to initialize your database and run a multi-step query that mimics output you could get with the temporal range-based query operators.

## Timescale setup

* Install postgres plus the timescaledb extension per instructions on the [timescaledb website](https://docs.timescale.com/v1.2/getting-started/installation/ubuntu/installation-apt-ubuntu). For consistency, use the same version of postgres I used (10.6) and probably best to not use the dockerized version for now.
  * Make sure to follow the instructions liked there to create the postgres superuser (just use pw 'postgres') in order to allow local connections to the DB.
* Initialize your `testdata` DB with the extension by running the `setup.sql` script.
* Download or generate the sine wave dataset, and initialize the tables using the `load_sinewaves_data.sql` script. Then run the command in the comments to load the dataset from csv.
* The `range_based_window_filter_query_using_temp_tables.sql` script runs a process (using various temp tables) that outputs something similar to what we would get once the temporal range filter feature is actually implemented. The filter ranges are hard coded into the first query, so this process currently would need to be rerun if a different filter range is needed. It's currently clocked as taking over 3 minutes to run, but may be faster with appropriate use of indexing and combining into a single query. Nevertheless, it's an initial proof of concept using stock timescaledb.
  * The main output of this process will be some set of fields (e.g., start and/or end range of the segment, a json array using the postgres `json_agg()` function representing values that can be plotted directly in a javascript UI, and maybe other fields.). If the user wants the timestamps along with the data values, we would need to return a second json array with the timestamps in ascending order. 

Other notes:

* Presumably, in many cases the user would want to filter based on some range relative to some already inferred threshold (e.g., from an anomaly detector). We can assume for now that this value would be stored in a separate table. Alternatively, maybe the user would want to choose some value like 25% below the threshold, in which case the exact values behind the scenes could be abstracted away. The exact user interaction still needs to be determined.
  * TODO: Need a better workflow diagram and UI mockup.

Caveats and possible issues:

* Queries that return very long segments will have performance problems. For example, what if a filter range encompasses the entire time span? We could for now set reasonable limits on the segment raw data returned.


## Jupyter Notebook prototype

There's a primitive jupyter notebook prototype the queries the database with the results of the filter process script mentioned above. It first shows the top 10 results by some metric and plots these as "previews".

The subsequent cell then provides a drill down window into the top segment, with some window buffer around it. 

Our actual implementation will need to make the first search fast; not sure if we will do much for the second window search besides use the in-built timescaledb and postgres indexing schemes.

Besides acting as a very primitive mock-up for a UI interaction, one could also imagine data scientists wanting to interact with the database using a jupyter notebook, so it could be part of our presentation as well.

Note that we would need to move the `range_based_window_filter_query_using_temp_tables.sql` queries into this notebook and sub out filter parameters, if we would want someone to be able to query using different filters in stock timescaleDB.

