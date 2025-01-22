import React, { useState, useMemo } from 'react';
import { tide, toLocalTime } from '../utils/LieutenantIslandTide';
import './TideChart.css';

// Utility functions
function formatTime(atime: Date): string {
    const localTime = toLocalTime(atime);
    let hr = localTime.getHours();
    let am = "am";
    if (hr > 12) {
        am = "pm";
        hr -= 12;
    }
    if (hr === 0) {
        hr = 12;
    }
    const minute = localTime.getMinutes().toString().padStart(2, '0');
    return `${hr}:${minute}${am}`;
}

function toFeet(inmeters: number): number {
    // 1 ft = 0.3048m
    return inmeters / 0.3048;
}

function toMeters(infeet: number): number {
    return infeet * 0.3048;
}

function formatHeight(height: number): string {
    return toFeet(height).toFixed(2);
}

function formatDate(year: number, month: number, day: number): string {
    const monthAbbrev = [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month];
    return `${monthAbbrev} ${day}`;
}

// from http://stackoverflow.com/questions/9847213/which-day-of-week-given-a-date-python
function weekDay(year: number, month: number, day: number): string {
    const offset = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const week = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
    const afterFeb = month > 2 ? 0 : 1;
    const aux = year - 1700 - afterFeb;
    // dayOfWeek for 1700/1/1 = 5, Friday
    let dayOfWeek = 5;
    // partial sum of days between current date and 1700/1/1
    dayOfWeek += (aux + afterFeb) * 365;
    // leap year correction    
    dayOfWeek += Math.floor(aux / 4) - Math.floor(aux / 100) + Math.floor((aux + 100) / 400);
    // sum monthly and day offsets
    dayOfWeek += offset[month - 1] + (day - 1);
    dayOfWeek %= 7;
    return week[dayOfWeek];
}

interface TideChartProps {
    year?: number;
    month?: number;
    height?: number;
}

const TideChart: React.FC<TideChartProps> = ({ 
    year: inputYear, 
    month: inputMonth, 
    height: inputHeight 
}) => {
    const DEFAULT_HEIGHT = 9.1;
    const currentDate = new Date();
    const [year, setYear] = useState(inputYear || currentDate.getFullYear());
    const [month, setMonth] = useState(inputMonth || currentDate.getMonth() + 1);
    const [nogoHeight, setNogoHeight] = useState(inputHeight || DEFAULT_HEIGHT);

    const [tableData, nogoTimes] = useMemo(() => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const tableData: Array<{
            date: string;
            day: string;
            amNogo: string;
            pmNogo: string;
            amHigh: string;
            pmHigh: string;
            isHighlight: boolean;
        }> = [];
        const newNogoTimes: [Date, Date, string][] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            let amNogo = "";
            let amHigh = "";
            let pmNogo = "";
            let pmHigh = "";

            // AM check
            let nogo = tide.findNOGO(toMeters(nogoHeight), year, month, day, true);
            if (nogo) {
                const [start, end, time, height] = nogo;
                amHigh = `${formatHeight(height)}@${formatTime(time)}`;
                if (start && end) {
                    newNogoTimes.push([start, end, amHigh]);
                    amNogo = `${formatTime(start)}-${formatTime(end)}`;
                }
            }

            // PM check
            nogo = tide.findNOGO(toMeters(nogoHeight), year, month, day, false);
            if (nogo) {
                const [start, end, time, height] = nogo;
                pmHigh = `${formatHeight(height)}@${formatTime(time)}`;
                if (start && end) {
                    newNogoTimes.push([start, end, pmHigh]);
                    pmNogo = `${formatTime(start)}-${formatTime(end)}`;
                }
            }

            tableData.push({
                date: formatDate(year, month, day),
                day: weekDay(year, month, day),
                amNogo,
                pmNogo,
                amHigh,
                pmHigh,
                isHighlight: day === (currentDate.getMonth() + 1 === month ? currentDate.getDate() : 0)
            });
        }

        return [tableData, newNogoTimes];
    }, [year, month, nogoHeight]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newYear = parseInt(formData.get('year') as string) || year;
        const newMonth = parseInt(formData.get('month') as string) || month;
        const newHeight = parseFloat(formData.get('height') as string) || nogoHeight;

        if (newYear < 9999 && newYear > 0) {
            setYear(newYear);
        }
        if (newMonth <= 12 && newMonth >= 1) {
            setMonth(newMonth);
        }
        if (newHeight > 0 && newHeight < 30) {
            setNogoHeight(newHeight);
        }
    };

    return (
        <div>
            <h1>Lieutenant Island Tide Chart</h1>
            
            <div id="formdiv" className="no-print">
                <form onSubmit={handleSubmit}>
                    <div>Year: <input type="text" defaultValue={year} name="year" /></div>
                    <div>Month: <input type="text" defaultValue={month} name="month" /></div>
                    <div>Height cutoff (ft): <input type="text" defaultValue={nogoHeight} name="height" /></div>
                    <div className="submitbutton">
                        <input type="submit" value="Submit" />
                    </div>
                </form>
            </div>

            <div id="tablediv">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>AM&nbsp;NO&nbsp;GO (over&nbsp;{nogoHeight}&nbsp;ft)</th>
                            <th>PM&nbsp;NO&nbsp;GO (over&nbsp;{nogoHeight}&nbsp;ft)</th>
                            <th>AM High Tide</th>
                            <th>PM High Tide</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => (
                            <tr key={index} className={row.isHighlight ? 'highlight' : 'hh'}>
                                <td>{row.date}</td>
                                <td>{row.day}</td>
                                <td>{row.amNogo}</td>
                                <td>{row.pmNogo}</td>
                                <td>{row.amHigh}</td>
                                <td>{row.pmHigh}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="no-print">
                <h4>About</h4>
                <p>
                    Uses data from Provincetown (not Wellfleet). Provincetown is hopefully the best <a href="http://tidesandcurrents.noaa.gov/harmonic.html">harmonic</a> station 
                    to approximate Wellfleet's tides. For a list of other harmonic stations see <a href="http://www.tidesandcurrents.noaa.gov/stations.html?type=Harmonic+Constituents">NOAA's list</a>.
                </p>
                <p>Note there is some randomness in the calculation, so refreshing the page can yield slightly different results.</p>
                <p>Developed by Lee Danilek. Please <a href="mailto:iwork96+tide@gmail.com">email the developer</a> with bug reports, comments, etc.</p>
                <p>Calculations are based on source code of Pytides, with code rewritten so it can be run online. Tide constants data are from <a href="tidesandcurrents.noaa.gov">noaa.gov</a></p>
            </div>
        </div>
    );
};

export default TideChart; 