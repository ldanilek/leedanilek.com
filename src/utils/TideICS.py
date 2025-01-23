
from datetime import datetime
from random import randint

from tide import toLocalTime


def doubleDigit(a):
    a = str(a)
    if len(a) < 2:
        return "0"+a
    return a

def formatDateICS(date):
    return str(int(date.year))+doubleDigit(date.month)+doubleDigit(date.day)+"T"+doubleDigit(date.hour)+doubleDigit(date.minute)+doubleDigit(date.second)
idsSoFar = []
def randomUID():
    i = ""
    while i in idsSoFar:
        i = ""
        for a in range(randint(5,15)):
            i += chr(randint(ord('0'),ord('9')))
    idsSoFar.append(i)
    return i

ics = [""]
def l(st):
    ics[0] += st + "\n" # should be \r\n but putting it in html strips the \r away

def makeICSFile(year, month, nogoTimes):
    l("BEGIN:VCALENDAR")
    l("CALSCALE:GREGORIAN")
    l("VERSION:2.0")
    l("METHOD:PUBLISH")
    l("X-WR-CALNAME:"+str(year)+"-"+doubleDigit(month)+" Tides")
    l("X-WR-TIMEZONE:America/New_York")
    l("X-APPLE-CALENDAR-COLOR:#1BADF8")
    l("BEGIN:VTIMEZONE")
    l("TZID:America/New_York")
    l("BEGIN:DAYLIGHT")
    l("TZOFFSETFROM:-0500")
    l("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU")
    l("DTSTART:20070311T020000")
    l("TZNAME:EDT")
    l("TZOFFSETTO:-0400")
    l("END:DAYLIGHT")
    l("BEGIN:STANDARD")
    l("TZOFFSETFROM:-0400")
    l("RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU")
    l("DTSTART:20071104T020000")
    l("TZNAME:EST")
    l("TZOFFSETTO:-0500")
    l("END:STANDARD")
    l("END:VTIMEZONE")

    icsCurrentStamp = formatDateICS(datetime.now())
    for nogostart,nogoend,highDisplay in nogoTimes:
        l("BEGIN:VEVENT")
        l("CREATED:"+icsCurrentStamp+"Z")
        l("UID:D24218FA-562D-4D10-8EE9-"+randomUID())
        l("DTEND;TZID=America/New_York:"+formatDateICS(toLocalTime(nogoend)))
        l("TRANSP:OPAQUE")
        l("SUMMARY:NO GO "+highDisplay)
        l("DTSTART;TZID=America/New_York:"+formatDateICS(toLocalTime(nogostart)))
        l("DTSTAMP:"+icsCurrentStamp+"Z")
        l("SEQUENCE:4")
        l("END:VEVENT")
    l("END:VCALENDAR")
    return ics[0]
