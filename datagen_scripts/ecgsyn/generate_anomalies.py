"""Script to generate anomalies and some anomaly detector raw values that seem
semi-realistic.

This will read in the output from ecgsyn: https://physionet.org/physiotools/ecgsyn/C/

The ECGSYN used to generate data (with noise) was:
    ./ecgsyn -O largedata3.txt -n 100000 -a 0.1
This generates about 33M data points.
(Note that using larger than this crashes the program)

The basic idea is as follows:
  - We assume the input file is quite large, so we process in chunks.
  - For each chunk we process, there is an associated probability of anomalies occurring.
    This is the probability that, over the entire length of the dataset, there are
    up to that many anomalous points that occur (note that all the points could be
    in one continuous segment, or across multiple segments).
  - For each anomalous region, we superimpose a shifted region of the same dataset over
    that region, so it looks "interesting" and different.
  - At the same time, we generate "anomaly detector raw values" which are at baseline
    the moving average. At the anomalous regions, we add some random value to this
    moving average and scale this by the shift (more shift = higher value).

Visually verified that this looks reasonably interesting.


"""
import argparse
import datetime
import os
import random

from matplotlib import pyplot as plt
import numpy as np
import pandas as pd


def process_file(filepath, outfilepath, chunksize=10000, show_plot=False):
    """Reads an ecgsyn file and transforms it into a dataset with anomalies
    along with anomaly detector values.

    :param filepath:
    :param outfilepath:
    :param chunksize:
    :param show_plot: If true, will show a plot.
    :return:
    """

    # Probability of having anomalous points as percent of total length
    anom_prob = 0.03

    start_time = datetime.datetime(2018, 1, 1, 9, 0, 0)  # times rel to this
    # If processing a second file to append to first, make sure to continue on
    # the subsequent datetime!
    # start_time = datetime.datetime(2019, 1, 24, 17, 41, 23)  # batch 2
    # start_time = datetime.datetime(2020, 2, 17, 2, 22, 46)  # batch 3

    # How long each anomalous segment can be
    min_anom_length = 10
    max_anom_length = 1000

    # How much we may shift the orig dataset to superimpose on itself
    # and create anomalies
    shift_range = 500
    min_shift = -shift_range
    max_shift = shift_range

    # Make sure to delete anything in the old file!
    if os.path.isfile(outfilepath):
        f = open(outfilepath, 'w')
        f.truncate()

    cur_time = start_time
    chunk_count = 1
    num_recs = 0

    with open(outfilepath, 'a') as f:
        for df_chunk in pd.read_csv(filepath, chunksize=chunksize, sep=' ',
                                    header=None):
            num_entries = len(df_chunk)

            # Generate a date field that is incremented by 1 second
            # at each time point
            date_list = pd.DataFrame(
                [cur_time + datetime.timedelta(seconds=i)
                 for i in range(0, num_entries)])

            # Only care about the column with ECG values
            df_values = df_chunk[1]

            if show_plot:
                # Only used for plotting ground truth for visual inspection
                # purposes
                anomaly_truth = np.zeros(len(df_chunk))

            # For bounding the number of anomalies we attempt to generate
            max_num_anoms = int(len(df_chunk) * anom_prob / min_anom_length)
            # Total anom length of all segments is bounded by
            # probability * total length
            total_max_anom_length = int(anom_prob * len(df_chunk))

            total_anom_length = 0
            anom_lengths = []
            while total_anom_length < total_max_anom_length and len(anom_lengths) < max_num_anoms:
                cur_anom_length = random.randint(min_anom_length, max_anom_length)
                anom_lengths.append(cur_anom_length)
                total_anom_length += cur_anom_length

            anom_start_idxs = []  # Holds a list of anomalous segments (tuples representing start,end)
            for i in range(0, len(anom_lengths)):
                anom_start_idxs.append(random.randint(0, len(df_chunk)))

            # Detector output's normal baseline is a moving average
            moving_avg_window_size = 100
            df_moving_avg = df_values.rolling(moving_avg_window_size).mean()

            # Edges of the chunk for detector moving avg will be NaN
            # so naively fill them in
            if len(df_moving_avg) > moving_avg_window_size:
                df_moving_avg = df_moving_avg.fillna(df_moving_avg.iloc[moving_avg_window_size + 1])
            else:
                df_moving_avg = df_moving_avg.fillna(0.1)

            # Original signal values are very small, so let's make then bigger!
            df_values = df_values * 100.0
            df_moving_avg = df_moving_avg.abs() * 300.0

            # Now lets generate some anomalies!
            # moving avg mean is about 32, max is 85,
            # so anomalies begin at threshold where value added is between 40 and 80

            # There's probably a way to superimpose dataframes, but had trouble getting
            # it to work, so hackily converting to np arrays to do this, then
            # later converting back to dataframes...
            df_moving_avg_nparray = df_moving_avg.values
            df_raw_data_nparray = df_values.values

            for idx, anom_start_idx in enumerate(anom_start_idxs):
                # Shift is how much we shift the current selected range
                # length is the length of the anomalous region
                shift = random.randint(min_shift, max_shift)

                # Start and end is where the shifted region will be
                # extracted from to superimpose on the current location
                # but we must make sure it's within range of the entire dataset
                start = anom_start_idx + shift
                anom_length = anom_lengths[idx]
                end = anom_start_idx + anom_length + shift

                if start < 0 or end >= len(df_chunk):
                    # Shifted region is out of range of the df, so ignore this anomaly
                    continue
                if (len(df_raw_data_nparray[anom_start_idx:anom_start_idx+anom_length]) !=
                        len(df_raw_data_nparray[start:end])):
                    # There's a random bug in the large data set where sometimes the shapes are incorrect.
                    # Seems to happen intermittently on the same file. Not sure why yet...
                    print('Shape mismatch when trying to overlay anomalies at chunk %i' % chunk_count)
                    print('shift indexes are (%i, %i), whereas data indexes are (%i, %i)' %
                          (start, end, anom_start_idx, anom_start_idx + anom_length))
                    continue
                df_raw_data_nparray[anom_start_idx:anom_start_idx+anom_length] += df_raw_data_nparray[start:end]

                if show_plot:
                    # This is only used for plotting to visually
                    # verify things look good
                    anomaly_truth[anom_start_idx:anom_start_idx + anom_length] = 1

                shift_normalized = float(abs(shift) / max_shift)
                # Now scale the random detector value increase by
                # (1.0 + normalized shift) so greater shifts equal higher anomaly
                # thresholds
                detector_raw_value_increase = random.randint(40, 100)
                detector_raw_value_increase = (
                        detector_raw_value_increase * (1.0 + shift_normalized))
                df_moving_avg_nparray[anom_start_idx:anom_start_idx + anom_length] += detector_raw_value_increase

            # Get rid of some digits after decimal
            processed_raw_data_df = pd.DataFrame(df_raw_data_nparray).round(3)
            detector_raw_values_df = pd.DataFrame(df_moving_avg_nparray).round(2)


            df_with_dates = pd.concat(
                [date_list.reset_index(drop=True),
                 processed_raw_data_df.reset_index(drop=True),
                 detector_raw_values_df.reset_index(drop=True)], axis=1)

            if show_plot and chunk_count == 1:
                fig, (ax1, ax2, ax3) = plt.subplots(3, 1)
                ax1.plot(df_raw_data_nparray)
                ax1.set_ylabel('ECG value (mv)')
                ax2.plot(df_moving_avg_nparray)
                ax2.set_ylabel('Detector output value (likelihood)')
                ax3.plot(anomaly_truth)
                ax3.set_ylabel('anomaly')
                plt.tight_layout()
                plt.savefig('syntheticdata_plot.png')
                return

            cur_time = cur_time + datetime.timedelta(seconds=num_entries)
            chunk_count += 1
            num_recs += len(df_chunk)

            df_with_dates.to_csv(f, header=False, index=False)
    print('Processed %i chunks of size %i totalling %i records.' %
          (chunk_count, chunksize, num_recs))
    print('Data output to %s' % outfilepath)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--inputfile', action='store', dest='inputfile',
                        required=True, help='Full path to ECGSYN generated file')
    parser.add_argument('--outputfile', type=str, required=True, help='Full path to outputfile')
    parser.add_argument('--plot', dest='showplot', default=False, action='store_true', help='If specified, plots an example chunk and stops further processing')
    parser.add_argument(
        '--chunksize', type=int, default=1000000,
        help='Number of records from ECGSYN file to process per chunk.')
    parserargs = parser.parse_args()


    process_file(parserargs.inputfile, parserargs.outputfile, chunksize=parserargs.chunksize, show_plot=parserargs.showplot)
