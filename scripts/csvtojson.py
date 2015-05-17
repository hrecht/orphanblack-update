#HR, 03-08-15
#CSV -> JSON for Orphan Black analysis

import csv
import json

output = { 'episodes': [] }

with open('/Users/Hannah/Documents/DataVizProjects/OrphanBlack/Data/OBAllEps.csv') as csv_file:
    for state in csv.DictReader(csv_file):
        output['episodes'].append({
                        'episode': int(state['episode']),
                        'startmin': float(state['startmin']),
                        'stopmin': float(state['stopmin']),
                        'character': state['character']
   })

output_json = json.dumps(output,allow_nan=True)
with open('/Users/Hannah/Documents/DataVizProjects/OrphanBlack/Data/obtimes.json', 'w') as f:
       json.dump(output, f)
