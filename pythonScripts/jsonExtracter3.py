import urllib.request
import urllib.error
import json
import csv
import string
import time
import sys



top10Url = 'http://developer.echonest.com/api/v4/artist/search?api_key=DLSWESE3XURBC96V4&format=json&sort=hotttnesss-desc&bucket=hotttnesss&bucket=genre&results=10&'
endUrl = 'artist_start_year_before='
startUrl   = 'artist_start_year_after='



#response = urllib.request.urlopen(genreUrl)
#content = response.read()
#json_str = json.dumps(content)
#data = json.loads(content.decode())
headers = ["DecadeStart","DecadeEnd","Name","Location","Start","End","Hotttnesss","Discovery","Familiarity"]
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




fp = open('output2.csv','w',encoding='utf-8',newline='')
writable = csv.writer(fp)
#open('output.txt','w',newline='')
top10List = []
#artistList.append(headers)
debug = True
count = 0
year = 1899
while(year<=2010):
    print(str(year))
    if count == 5:
        count = 0
        #debug = False
        print("Going to sleep for 60 secs")
        time.sleep(60)
    url = top10Url+startUrl+str(year)+'&'+endUrl+str(year+11)

    if debug==True:
        print(url)
        try:
            response = urllib.request.urlopen(url)
            count = count +1
            content = response.read()
            data = json.loads(content.decode('utf-8'))
            for artist in data ['response']['artists']:
                #print("here")
                artistData = []
                if nameKey in artist:
                    #if isAscii(artist[nameKey])==True:
                    name = artist[nameKey]
                    artistData.append(str(year))
                    artistData.append(str(year+11))
                    artistData.append(artist[nameKey])
                    artistData.append(artist['id'])
                    #artistData.append(artist['genres'])
                    if hotKey in artist:
                        artistData.append(artist[hotKey])
                    else:
                        artistData.append(0)
                    #print(artistData)
                    top10List.append(artistData)
        except urllib.error.HTTPError as e:
            print(e.code)
            print(e.read())
        except urllib.error.URLError as e:
            print(e.code)
            print(e.read())



        if count == 5:
            count = 0
            #debug = False
            print("sleep for 60 secs")
            time.sleep(60)

    year = year+10
    for top10 in top10List:
        writable.writerow(top10)

    fp.close()
    fp = open('output2.csv',mode='a',encoding='utf-8',newline='')
    writable = csv.writer(fp)
    top10List = []

