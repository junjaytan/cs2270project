"""
Simple script to generate a csv file of ascending value by
time to verify ordering in timespandb using array_agg
and time bucketing functions.
"""
import csv
import datetime
import random


def gen_data(start_datetime, increments=100, shuffle=True):
    """Returns a list of ascending values by minute.
    
    The list contains tuples (datetime str, value), where
    datetime is incremented by 1 minute at each step,
    and value is also incremeted by 1 at each step.
    """
    data = []
    for i in range(0, increments):
        cur_datetime = start_datetime + datetime.timedelta(minutes=i)
        data.append(
            (cur_datetime.strftime('%Y-%m-%d %H:%M:%S'), i))
    
    if shuffle:
        random.shuffle(data)
    return data


if __name__ == '__main__':
    start = datetime.datetime(2018, 1, 1)

    data = gen_data(start, 100000)
    with open('incrementing_values.csv', mode='w') as outfile:
        mywriter = csv.writer(outfile, delimiter=',', quotechar='"', 
                              quoting=csv.QUOTE_MINIMAL)
        headers = ['my_datetime', 'value']
        mywriter.writerow(headers)
        for row in data:
            mywriter.writerow(row)

