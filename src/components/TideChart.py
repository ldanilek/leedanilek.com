from datetime import datetime
from calendar import monthrange
import cgi
from utils.LieutenantIslandTide import tide, toLocalTime

# input in GMT
def formatTime(atime):
    atime = toLocalTime(atime)
    hr = atime.hour
    am = "am"
    if hr > 12:
        am = "pm"
        hr -= 12
    if hr == 0:
        hr = 12
    minute = str(int(atime.minute))
    if len(minute) < 2:
        minute = "0"+minute
    return str(int(hr))+":"+minute+am
def toFeet(inmeters):
    #1 ft = 0.3048m
    return inmeters / 0.3048
def toMeters(infeet):
    return infeet * 0.3048
# input in meters
def formatHeight(height):
    height = toFeet(height)
    return "%.2f" % height
def formatDate(year, month, day):
    monthAbbrev = [None, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month]
    month = str(month)
    if len(month) < 2:
        month = "0"+month
    return monthAbbrev+" "+str(day)#+", "+str(year)

NOGOHEIGHT = 9.1

currentDateTime = datetime.now()
year = int(currentDateTime.year)
month = int(currentDateTime.month)
currentDay = int(currentDateTime.day)
form = cgi.FieldStorage()
inputYear = year
inputMonth = month
inputHeight = NOGOHEIGHT
if form.has_key("year"):
    try:
        inputYear = int(form["year"].value)
    except ValueError:
        pass
    if inputYear < 9999 and inputYear > 0 and year!=inputYear:
        year = inputYear
        currentDay = 0
if form.has_key("month"):
    try:
        inputMonth = int(form["month"].value)
    except ValueError:
        pass
    if inputMonth <= 12 and inputMonth >= 1 and inputMonth!=month:
        month = inputMonth
        currentDay = 0
if form.has_key("height"):
    try:
        inputHeight = float(form["height"].value)
    except ValueError:
        pass
    if inputHeight > 0 and inputHeight < 30:
        NOGOHEIGHT = inputHeight

nogoTimes = [] # array of (start, end, "highHeight@highTime")

# from http://stackoverflow.com/questions/9847213/which-day-of-week-given-a-date-python
def weekDay(year, month, day):
    offset = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    week   = ['Su', 
              'M', 
              'Tu', 
              'W', 
              'Th',  
              'F', 
              'Sa']
    afterFeb = 1
    if month > 2: afterFeb = 0
    aux = year - 1700 - afterFeb
    # dayOfWeek for 1700/1/1 = 5, Friday
    dayOfWeek  = 5
    # partial sum of days betweem current date and 1700/1/1
    dayOfWeek += (aux + afterFeb) * 365                  
    # leap year correction    
    dayOfWeek += aux / 4 - aux / 100 + (aux + 100) / 400     
    # sum monthly and day offsets
    dayOfWeek += offset[month - 1] + (day - 1)               
    dayOfWeek %= 7
    return week[dayOfWeek]

# returns string of HTML
def NOGOTableForMonth(year, month, highlightDay = 0):
    tbl = "<table>"
    tbl += "<tr><th>Date</th><th>Day</th><th>AM&nbsp;NO&nbsp;GO (over&nbsp;"+str(NOGOHEIGHT)+"&nbsp;ft)</th><th>PM&nbsp;NO&nbsp;GO (over&nbsp;"+str(NOGOHEIGHT)+"&nbsp;ft)</th><th>AM High Tide</th><th>PM High Tide</th></tr>"
    for day in range(1, monthrange(year, month)[1]+1):
        nogo = tide.findNOGO(toMeters(NOGOHEIGHT), year, month, day, True)
        AMNOGO = ""
        AMHIGH = ""
        PMNOGO = ""
        PMHIGH = ""
        if nogo:
            start, end, time, height = nogo
            AMHIGH = formatHeight(height)+"@"+formatTime(time)
            if start!=False and end!=False:
                nogoTimes.append((start, end, AMHIGH))
                AMNOGO = formatTime(start)+"-"+formatTime(end)
        nogo = tide.findNOGO(toMeters(NOGOHEIGHT), year, month, day, False)
        if nogo:
            start, end, time, height = nogo
            PMHIGH = formatHeight(height)+"@"+formatTime(time)
            if start!=False and end!=False:
                nogoTimes.append((start, end, PMHIGH))
                PMNOGO = formatTime(start)+"-"+formatTime(end)
        date = formatDate(year, month, day)
        if day==highlightDay:
            tbl += "<tr class='highlight'>"
        else:
            tbl += "<tr class='hh'>"
        tbl += "<td>"+date+"</td><td>"+weekDay(year, month, day)+"</td><td>"+AMNOGO+"</td><td>"+PMNOGO+"</td><td>"+AMHIGH+"</td><td>"+PMHIGH+"</td>"
        tbl += "</tr>"
    tbl += "</table>"
    return tbl
nogoTable = NOGOTableForMonth(year, month, currentDay)


print("Content-type: text/html\n\n")
print("<html><head>")
print("<title>Wellfleet Tides</title>")
print("<style>th {"+"text-align:center;border:1px solid black;"+"}")
print("table {"+"width:100%;border:1px solid black;border-collapse:collapse;"+"}")
print("td {"+"text-align:center;border:1px solid black;"+"}")
print("h1 {"+"text-align:center;"+"}")
print("#formdiv {"+"text-align:right;"+"}")
print(".submitbutton {"+"margin:0 auto;margin-bottom: 10px;width:100px;"+"}")
print("form {"+"margin: 0 auto; width:300px;"+"}")
print(".small {"+"font-size:11px;"+"}")
print("@media print{")
print(".no-print, .no-print *{display: none !important;}")
print("tr {"+"background-color:white;color:black;"+"}")
print("}")
print(".highlight {"+"background-color:yellow;"+"}")
print("tr.hh:hover {"+"background-color:#99FF99;"+"}") ## class hh for highlighting on hover
print(".no-show {"+"display: none !important;}")
print("</style>")
print("<script>")
print("""
function download(form) {
    text = form["text"].value;
    window.open( "data:text/calendar;charset=utf8," + escape(text));
    return false;
}""")
print("</script>")
print("</head><body>")

print("<h1>Lieutenant Island Tide Chart</h1>")

#print "<p>Current date is "+str(datetime(2015,5,19,1,0,0))+"</p>";

print("<div id='formdiv' class='no-print'>")
print("<form action='tide.py' method='GET'>")
print("Year: <input type='text' value='"+str(year)+"' name='year'><br />")
print("Month: <input type='text' value='"+str(month)+"' name='month'><br />")
print("Height cutoff (ft): <input type='text' value='"+str(NOGOHEIGHT)+"' name='height'><br />")
print("<div class='submitbutton'><input type='submit' value='Submit'></div>")
print("</form>")
print("</div>")

print("<div id='tablediv'>")


print(nogoTable)
print("</div>")

print("<h4 class='no-print'>About</h4>")
print("<p class='no-print'>Uses data from Provincetown (not Wellfleet). Provincetown is hopefully the best <a href='http://tidesandcurrents.noaa.gov/harmonic.html'>harmonic</a> station to approximate Wellfleet's tides. For a list of other harmonic stations see <a href='http://www.tidesandcurrents.noaa.gov/stations.html?type=Harmonic+Constituents'>NOAA's list</a>. ")
print("<p class='no-print'>Note there is some randomness in the calculation, so refreshing the page can yield slightly different results.</p>")
print("<p class='no-print'>Developed by Lee Danilek. Please <a href='mailto:iwork96+tide@gmail.com'>email the developer</a> with bug reports, comments, etc.</p>")
print("<p class='no-print'>Calculations are based on source code of Pytides, with code rewritten so it can be run online. Tide constants data are from <a href='tidesandcurrents.noaa.gov'>noaa.gov</a></p>")

print("</body></html>")
