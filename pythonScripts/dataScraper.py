__author__ = 'Ryan'
import csv

reader = csv.reader(open('artist.csv','r',encoding='utf-8'))
next(reader)
fp = open('output2.csv','w',encoding='utf-8',newline='')
writable = csv.writer(fp)
headers = ["artist","ID","Location","Start","End"]
artistList = []
artistList.append(headers)
inTable = False
firstElem = False
for musician in reader:
    id = musician[1]
    artist=[]
    if firstElem == True:
        for art in artistList:
            if art[1]== id:
                print(id)
                inTable = True
                break

    if inTable==False:
        firstElem = True
        artist.append(musician[0])
        artist.append(musician[1])
        artist.append(musician[3])
        artist.append(musician[4])
        artist.append(musician[5])
        artist.append(musician[6])
        #print(artist)
        artistList.append(artist)

    inTable = False
for musician in artist:
    writable.writerow(musician)