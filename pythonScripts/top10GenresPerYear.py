import csv
import string
import time
import sys

reader = csv.reader(open("genresAvgPerYear.csv",encoding='utf-8'))
writer = csv.writer(open("output.csv",'w',encoding='utf-8',newline=''))
#next(reader)
headers = ["GENRE","YEAR","Hotttniess"]
genres = []
start = 1900
end   = 1910
count = 0
avg = 0
first = True
'''genre=[]
next(reader)
for artist in reader:
    if ((first==False) and (artist[2]!=genre[0])):
        avg = float(avg/count)
        genre.append(str(avg))
        genre.append(count)
        writer.writerow(genre)
        genre = []
        genre.append(artist[2])
        genre.append(artist[4])
        count = 0
        avg = 0


    if first==True:
        genre.append(artist[2])
        genre.append(artist[4])
        first=False


    count = count + 1
    avg = avg + float(artist[6])
    '''


first = True
inGernes = False
genrelist = []
for artist in reader:

    if first == False and end == int(artist[1]):
        print(end)
        for genre in genrelist:
            genreAvg = []
            genreAvg.append(genre[0])
            genreAvg.append(genre[1])
            genreAvg.append(genre[2])
            genreAvg.append(genre[3]/genre[4])
            genreAvg.append(genre[4])
            genreAvg.append(genre[5])
            writer.writerow(genreAvg)
        start = start + 10
        end   = end + 10
        genrelist = []


    if first==True:
        genres.append(artist[0])
        genres.append(start)
        genres.append(end-1)
        genres.append(float(artist[2]))
        genres.append(1)
        genres.append(int(artist[3]))
        genrelist.append(genres)
        first=False
    else:
        for genre in genrelist:
            if(genre[0]==artist[0]):
                genre[3]=genre[3] + float(artist[2])
                #print(genre[4]+1)
                genre[4] = genre[4] + 1
                genre[5] = genre[5] + int(artist[3])
                inGernes=True
                break

        if(inGernes==False):
            genres.append(artist[0])
            genres.append(start)
            genres.append(end-1)
            genres.append(float(artist[2]))
            genres.append(1)
            genres.append(int(artist[3]))
            genrelist.append(genres)
            genres = []
        inGernes = False


for genre in genrelist:
    genreAvg = []
    genreAvg.append(genre[0])
    genreAvg.append(genre[1])
    genreAvg.append(genre[2])
    genreAvg.append(genre[3]/genre[4])
    genreAvg.append(genre[4])
    genreAvg.append(genre[5])
    writer.writerow(genreAvg)









