"""
Simple script to generate a sine wave dataset, which allows
some testing of filtering by values. One column is a sine wave,
whereas the other column is a random value picked from a normal
distribution.
"""
import csv
import datetime
import math
import random


def calc_sine_value(time_value, amplitude, freq=1, phase=0):
    return amplitude * math.sin(freq * time_value + phase)


def gen_data(start_datetime, increments=100, shuffle=True, 
             amplitude1=1.0, freq1=1.0, offset1=0.0, amplitude2=1.0, freq2=1.0,
             offset2=5.0):
    """Returns a list of data matching a sine wave.
    
    The list contains tuples (datetime str, sinewave1 value, sinewave2 value), 
    where datetime is incremented by 1 minute at each step. The second sinewave
    should be offset by some phase.
    """
    data = []
    for i in range(0, increments):
        cur_datetime = start_datetime + datetime.timedelta(minutes=i)
        sine1_val = calc_sine_value(i, amplitude1, freq1, offset2)
        sine2_val = calc_sine_value(i, amplitude2, freq2, offset2)
        data.append(
            (cur_datetime.strftime('%Y-%m-%d %H:%M:%S'), 
             sine1_val, 
             sine2_val))
    
    if shuffle:
        random.shuffle(data)
    return data


if __name__ == '__main__':
    start = datetime.datetime(2018, 1, 1)

    data = gen_data(start, 500000, amplitude1=10.0, freq1=0.5,
                    amplitude2=5.0, freq2=0.75, offset2=10.0)
    with open('sine_waves_data.csv', mode='w') as outfile:
        mywriter = csv.writer(outfile, delimiter=',', quotechar='"', 
                              quoting=csv.QUOTE_MINIMAL)
        headers = ['my_datetime', 'sine1_value', 'sine2_value']
        mywriter.writerow(headers)
        for row in data:
            mywriter.writerow(row)