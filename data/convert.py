"""
Opens the given CSV, fixing the incorrect JSONs (which are really python dict style), and then resaves the CSV
for ingesting.
"""
import csv
import json
import ast

def convert_metadata():
  with open('./metadataout.csv', 'w') as csvout:
    with open('./movies_metadata.csv', 'r') as csvin:
      reader = csv.reader(csvin, quotechar='"')
      writer = csv.writer(csvout, doublequote=False, escapechar='\\')
      i = 0

      for row in reader:
        ## format fixes
        if i != 0:
          try:
            row[1] = json.dumps(ast.literal_eval(row[1]))
          except:
            print('omitting')

          try:
            row[3] = json.dumps(ast.literal_eval(row[3]))
          except:
            print('omitting')

          try:
            row[12] = json.dumps(ast.literal_eval(row[12]))
          except:
            print('omitting')

          try:
            row[13] = json.dumps(ast.literal_eval(row[13]))
          except:
            print('omitting')

          try:
            row[17] = json.dumps(ast.literal_eval(row[17]))
          except:
            print('omitting')

        writer.writerow(row)
        i += 1

convert_metadata()