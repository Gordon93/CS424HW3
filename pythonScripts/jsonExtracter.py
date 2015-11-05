import urllib.request
import json
import csv

#genreUrl = 'http://developer.echonest.com/api/v4/genre/list?api_key=DLSWESE3XURBC96V4&format=json'
listUrl = 'http://developer.echonest.com/api/v4/artist/search?api_key=DLSWESE3XURBC96V4&'
buckets = '&bucket=hotttnesss&bucket=genre&bucket=years_active&bucket=discovery&bucket=familiarity&results=100&start='


#response = urllib.request.urlopen(genreUrl)
#content = response.read()
#json_str = json.dumps(content)
#data = json.loads(content.decode())
headers = ["artist","genre","Years Active","Hotttnesss","Discovery","Familiarity"]
genre = []
yearsActive = []

reader = csv.reader(open('genres.csv'))
writable = csv.writer(open('output.txt','w',newline=''))
artist = []
artist.append(headers)
debug = True
for genre in reader:
    style = genre[0]
    #print(style)
    genreLIstUrl = listUrl+"style="+style+buckets
    start = 0
    if debug==True:
        while start<100 :
            print(style)
            url = genreLIstUrl + str(start)
            print(url)
            response = urllib.request.urlopen(url)
            content = response.read()
            data = json.loads(content.decode('utf-8'))
            for artist in data ['response']['artists']:
                #print(artist['name'])
                #print(data['response']['artists'][0]['name'])
                #print(data['response']['artists'][0]['genres'][0]['name'])
                #print(data['response']['artists'][0]['familiarity'])
                #print(data['response']['artists'][0]['hotttnesss'])
                #print(data['response']['artists'][0]['years_active'])
                #print(data['response']['artists'][0]['discovery'])

            start = start + 100
    debug = False


#print(data['response']['genres'][0]['name'])

#for genre in data['response']['genres']:
 #   name = [genre['name']]
  #  print(name)
   # genres.append(name)


#print(genres)
#for name in genres:
 #   print(name)
#for genre in genres:
 #       writable.writerow(genre)
