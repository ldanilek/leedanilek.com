function doubleDigit(a: number | string): string {
    a = a.toString();
    if (a.length < 2) {
        return "0" + a;
    }
    return a;
}

function formatDateICS(date: Date): string {
    return date.getFullYear().toString() +
        doubleDigit(date.getMonth() + 1) +
        doubleDigit(date.getDate()) +
        "T" +
        doubleDigit(date.getHours()) +
        doubleDigit(date.getMinutes()) +
        doubleDigit(date.getSeconds());
}

const idsSoFar: string[] = [];

function randomUID(): string {
    let i = "";
    do {
        i = "";
        const length = Math.floor(Math.random() * 11) + 5; // randint(5,15)
        for (let a = 0; a < length; a++) {
            i += String.fromCharCode(Math.floor(Math.random() * 10) + 48); // random digit 0-9
        }
    } while (idsSoFar.includes(i));
    
    idsSoFar.push(i);
    return i;
}

type NogoTime = [Date, Date, string]; // [start, end, highDisplay]

export function makeICSFile(year: number, month: number, nogoTimes: NogoTime[]): string {
    const ics: string[] = [];
    const l = (st: string) => ics.push(st); // should be \r\n but putting it in html strips the \r away

    l("BEGIN:VCALENDAR");
    l("CALSCALE:GREGORIAN");
    l("VERSION:2.0");
    l("METHOD:PUBLISH");
    l("X-WR-CALNAME:" + year + "-" + doubleDigit(month) + " Tides");
    l("X-WR-TIMEZONE:America/New_York");
    l("X-APPLE-CALENDAR-COLOR:#1BADF8");
    l("BEGIN:VTIMEZONE");
    l("TZID:America/New_York");
    l("BEGIN:DAYLIGHT");
    l("TZOFFSETFROM:-0500");
    l("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU");
    l("DTSTART:20070311T020000");
    l("TZNAME:EDT");
    l("TZOFFSETTO:-0400");
    l("END:DAYLIGHT");
    l("BEGIN:STANDARD");
    l("TZOFFSETFROM:-0400");
    l("RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU");
    l("DTSTART:20071104T020000");
    l("TZNAME:EST");
    l("TZOFFSETTO:-0500");
    l("END:STANDARD");
    l("END:VTIMEZONE");

    const icsCurrentStamp = formatDateICS(new Date());
    
    for (const [nogostart, nogoend, highDisplay] of nogoTimes) {
        l("BEGIN:VEVENT");
        l("CREATED:" + icsCurrentStamp + "Z");
        l("UID:D24218FA-562D-4D10-8EE9-" + randomUID());
        l("DTEND;TZID=America/New_York:" + formatDateICS(nogoend));
        l("TRANSP:OPAQUE");
        l("SUMMARY:NO GO " + highDisplay);
        l("DTSTART;TZID=America/New_York:" + formatDateICS(nogostart));
        l("DTSTAMP:" + icsCurrentStamp + "Z");
        l("SEQUENCE:4");
        l("END:VEVENT");
    }
    
    l("END:VCALENDAR");
    return ics.join("\r\n");
} 