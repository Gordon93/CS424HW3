import urllib.request
import urllib.error
import json
import csv
import string

fp = open('genre4.csv','w',newline='')
writable = csv.writer(fp)

url = 'http://developer.echonest.com/api/v4/genre/list?api_key=DLSWESE3XURBC96V4&format=json&start=800'
response = urllib.request.urlopen(url)
content = response.read()
data = json.loads(content.decode('utf-8'))
genrelist = []
for genre in data ['response']['genres']:
    name = [genre['name']]
    genrelist.append(name)

for genre in genrelist:
    writable.writerow(genre)

fp.close()
