import urllib.request
import json
import csv
import string
import sys




#genreUrl = 'http://developer.echonest.com/api/v4/genre/list?api_key=DLSWESE3XURBC96V4&format=json'
listUrl = 'http://developer.echonest.com/api/v4/artist/search?api_key=DLSWESE3XURBC96V4&'
buckets = '&bucket=hotttnesss&bucket=artist_location&bucket=years_active&bucket=discovery&bucket=familiarity&results=100&start='


#response = urllib.request.urlopen(genreUrl)
#content = response.read()
#json_str = json.dumps(content)
#data = json.loads(content.decode())
headers = ["artist","genre","Start","End","Location","Hotttnesss","Discovery","Familiarity"]
genre = []
yearsActive = []
locKey = 'artist_location'
rlocKey = 'location'

nameKey = 'name'
hotKey = 'hotttnesss'
actKey = 'years_active'
famKey = 'familiarity'
disKey = 'discovery'


def spaces(genre):
    retname = ''
    for char in genre:
        if char == ' ':
            retname = retname + '%20'
        else:
            retname = retname + char
    return retname
def isAscii(word):
    for char in word:
        if char not in string.ascii_letters:
            return False

    return True



reader = csv.reader(open('genres.csv'))
writable = csv.writer(open('output.csv','w',encoding='utf-8',newline=''))
#open('output.txt','w',newline='')
artistList = []
artistList.append(headers)
debug = True
for genre in reader:
    genreName = genre[0]
    genreName = "rap"
    style = spaces(genreName)
    #print(style)
    genreLIstUrl = listUrl+"style="+style+buckets
    startR = 0
    if debug==True:
        while startR<1000 :
            #print(style)
            url = genreLIstUrl + str(startR)
            print(url)
            response = urllib.request.urlopen(url)
            content = response.read()
            data = json.loads(content.decode('utf-8'))
            for artist in data ['response']['artists']:
                artistData = []
                start = 9999
                end = 9999
                if nameKey in artist:
                    #if isAscii(artist[nameKey])==True:
                        name = artist[nameKey]
                        artistData.append(artist[nameKey])
                        artistData.append(genreName)
                        if locKey in artist:
                            #print(artist['artist_location'])
                            artistData.append( artist[locKey][rlocKey])
                        else:
                            artistData.append("none")

                        if actKey in artist:
                            for years in artist[actKey]:
                                if 'start' in years:
                                    start = years['start']
                                else :
                                    start = 9999
                                if 'end' in years:
                                    end = years['end']
                                else:
                                    end = 9999
                            artistData.append(start)
                            artistData.append(end)
                        else:
                            artistData.append(0)
                            artistData.append(0)

                        if famKey in artist:
                            artistData.append(artist[famKey])
                        else:
                            artistData.append(0)
                        if hotKey in artist:
                            artistData.append(artist[hotKey])
                        else:
                            artistData.append(0)
                        if disKey in artist:
                            artistData.append(artist[disKey])
                        else:
                            artistData.append(0)
                        #print(artistData)
                        artistList.append(artistData)

            startR = startR + 100

        debug = False
        for artist in artistList:
            writable.writerow(artist)



                #print(data['response']['artists'][0]['name'])
                #print(data['response']['artists'][0]['genres'][0]['name'])
                #print(data['response']['artists'][0]['familiarity'])
                #print(data['response']['artists'][0]['hotttnesss'])
                #print(data['response']['artists'][0]['years_active'])
                #print(data['response']['artists'][0]['discovery'])







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
