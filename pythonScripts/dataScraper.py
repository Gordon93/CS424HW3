__author__ = 'Ryan'
import csv
from urllib.request import urlopen
from xml.etree.ElementTree import parse

import untangle

genre_URL = 'http://developer.echonest.com/api/v4/genre/list?api_key=DLSWESE3XURBC96V4&format=json'
genreList = []

url = urlopen(genre_URL)
doc = parse(url)
for item in doc.iterfind('genres'):
    genre = item.findtext('genre')
    print(genre)
#string = str(url)
#data = json.load(url)
#print(data)

#parsed_json = json.loads(url)



#for node in parsed_json:
   # print(node)
    #genreList.append(node);

#for genre in genreList:
 #   print(genre)




