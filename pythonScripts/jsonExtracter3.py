import urllib.request
import urllib.error
import json
import csv
import string
import time
import sys



top100Url = 'http://developer.echonest.com/api/v4/artist/similar?api_key=DLSWESE3XURBC96V4&format=json&results=1&start=0&max_familiarity=1&bucket=familiarity'
id = '&id='

#response = urllib.request.urlopen(genreUrl)
#content = response.read()
#json_str = json.dumps(content)
#data = json.loads(content.decode())
headers = ["ID1","ID2","Strength"]
genre = []
IDKey = 'id'
famKey = 'familiarity'



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



reader = csv.reader(open('top10perdecade.csv'))
fp = open('output2.csv','w',encoding='utf-8',newline='')
writable = csv.writer(fp)
#open('output.txt','w',newline='')
top100List = []
#artistList.append(headers)
debug = True
count = 0
for artist in reader:
    if count == 10:
        count = 0
        #debug = False
        print("Going to sleep for 60 secs")
        time.sleep(60)
    url = top100Url+id+artist[3]

    if debug==True:
        print(url)
        try:
            response = urllib.request.urlopen(url)
            count = count +1
            content = response.read()
            data = json.loads(content.decode('utf-8'))
            for comp in data ['response']['artists']:
                #print("here")
                artistData = []
                #if isAscii(artist[nameKey])==True:
                artistData.append(artist[3])
                artistData.append(comp[IDKey])
                artistData.append(comp[famKey])
                #artistData.append(artist['genres'])
                #print(artistData)
                top100List.append(artistData)
        except urllib.error.HTTPError as e:
            print(e.code)
            print(e.read())
        except urllib.error.URLError as e:
            print(e.code)
            print(e.read())



        if count == 10:
            count = 0
            #debug = False
            print("sleep for 60 secs")
            time.sleep(60)


    for top100 in top100List:
        writable.writerow(top100)

    fp.close()
    fp = open('output2.csv',mode='a',encoding='utf-8',newline='')
    writable = csv.writer(fp)
    top100List = []

