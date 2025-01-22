import { _Z0, d2r, astro, simpleAstro, noaa, BaseConstituent } from './TideMath';

const delta = 0.02;
const deltaT = delta * 60 * 60 * 1000; // convert hours to milliseconds

// given vector of numbers, multiply each by scalar number
function vecTimesScalar(scal: number, vec: number[]): number[] {
    return vec.map(v => v * scal);
}

function modEach360(vec: number[]): number[] {
    return vec.map(v => v % 360.0);
}

function getSeconds(td: number): number {
    return td / 1000; // Convert milliseconds to seconds
}

// Using built-in Date methods since they're sufficient for our needs
export function toLocalTime(atime: Date): Date {
    // Create a new Date object to avoid modifying the input
    const utcDate = new Date(atime.getTime());
    // Convert UTC to Eastern Time by subtracting the timezone offset
    const easternDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
    return easternDate;
}

function toGMT(atime: Date): Date {
    // Create a new Date object to avoid modifying the input
    const localDate = new Date(atime.getTime());
    // Convert local time to UTC by adding the timezone offset
    const gmtDate = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000));
    return gmtDate;
}

class Tide {
    private phases: number[];
    private amplitudes: number[];
    private constituents: BaseConstituent[];
    // store these values to be used often, hopefully will increase speed
    // set to null before making a calculation at a much different time
    private speed: number[] | null = null;
    private u: number[] | null = null;
    private f: number[] | null = null;

    constructor(constituents: BaseConstituent[], amplitudes: number[], phases: number[]) {
        this.phases = vecTimesScalar(d2r, phases);
        this.amplitudes = amplitudes;
        this.constituents = constituents;
    }

    private prepare(t0: Date): [number[], number[], number[], number[]] {
        const constituents = this.constituents;
        // The equilibrium argument is constant and taken at the beginning of the
        // time series (t0). The speed of the equilibrium argument changes very
        // slowly, so again we take it to be constant over any length of data. The
        // node factors change more rapidly.
        const a0 = simpleAstro(t0);
        // For convenience give u, V0 (but not speed!) in [0, 360)
        const V0 = vecTimesScalar(d2r, constituents.map(c => c.V(a0)));

        if (this.speed === null || this.u === null || this.f === null) {
            const a0 = astro(t0);
            this.speed = vecTimesScalar(d2r, constituents.map(c => c.speed(a0)));
            this.u = vecTimesScalar(d2r, modEach360(constituents.map(c => c.u(a0))));
            this.f = modEach360(constituents.map(c => c.f(a0)));
        }

        return [this.speed, this.u, this.f, V0];
    }

    at(t: Date[]): number[] {
        const t0 = t[0];
        const hours = t.map(ti => getSeconds(ti.getTime() - t0.getTime()) / 3600.0); // just use offset from first
        const [speed, u, f, V0] = this.prepare(t0);
        return Tide._tidal_series(hours, this.amplitudes, this.phases, speed, u, f, V0);
    }

    private static _tidal_series(
        t: number[], 
        amplitude: number[], 
        phase: number[], 
        speed: number[], 
        u: number[], 
        f: number[], 
        V0: number[]
    ): number[] {
        // t is an array with the times, starting at t0. so [0 6] for two times six hours apart
        // amplitude is an array of values direct from input amplitude.
        // phase is in radians
        // speed is 2pi/period (radians per hour)
        // f, u, and V0 are all from the constituents. they just depend on time
        // here they are constant for each constituent
        const heights: number[] = new Array(t.length).fill(0);
        for (let i = 0; i < t.length; i++) {
            for (let j = 0; j < amplitude.length; j++) {
                heights[i] += amplitude[j] * f[j] * Math.cos(speed[j]*t[i] + V0[j] + u[j] - phase[j]);
            }
        }
        return heights;
    }

    // gets derivative and values of the tide at a given date
    // also gives second derivative
    // result is in (meters, meters / hour, meters / hour^2)
    // use for Newton's method
    heightAndCurrentAt(time: Date): [number, number, number] {
        const beforeAndAfter = [
            new Date(time.getTime() - 2*deltaT),
            new Date(time.getTime() - deltaT),
            time,
            new Date(time.getTime() + deltaT),
            new Date(time.getTime() + 2*deltaT)
        ];
        const heightsBeforeAndAfter = this.at(beforeAndAfter);
        const height = heightsBeforeAndAfter[2];
        const d2 = 2*delta;
        const deriv = (heightsBeforeAndAfter[3]-heightsBeforeAndAfter[1]) / d2;
        const derivBefore = (heightsBeforeAndAfter[2]-heightsBeforeAndAfter[0]) / d2;
        const derivAfter = (heightsBeforeAndAfter[4]-heightsBeforeAndAfter[2]) / d2;
        const secondDeriv = (derivAfter - derivBefore) / d2;
        return [height, deriv, secondDeriv];
    }

    // given an approximate time and height goal, find where the tide is that height (near that time, hopefully)
    // returns false if not found (got stuck in a local min/max or something) or [time, GoingInBoolean] otherwise
    solveForTideAtHeightNear(time: Date, height: number): [Date, boolean] | false {
        const ACCEPTABLE_ERROR = 0.0001;
        let iterations = 0;
        let currentTime = new Date(time.getTime());
        let [h, slope, a] = this.heightAndCurrentAt(currentTime);
        
        while (iterations < 50 && Math.abs(h - height) > ACCEPTABLE_ERROR) {
            // height = h + m(t - time) + a(t - time)^2/2
            // height = h + mT + aT^2/2
            // solve for T, then t = T + time
            // 0 = (a/2)T^2 + (m)T + (h - height)
            if (Math.abs(a) < 0.0001) {
                // 0 = (m) T + (h - height)
                // T = (height - h)/m
                currentTime = new Date(currentTime.getTime() + (height - h) / slope * 3600000); // Convert hours to milliseconds
            } else {
                // T = (-m \pm sqrt(m^2 + 2a(height - h))) / (a)
                const discriminant = slope*slope + 2*a*(height - h);
                if (discriminant < 0) {
                    return false;
                } else {
                    const side1 = (-slope + Math.sqrt(discriminant)) / a;
                    const side2 = (-slope - Math.sqrt(discriminant)) / a;
                    const adjustment = Math.abs(side1) < Math.abs(side2) ? side1 : side2;
                    currentTime = new Date(currentTime.getTime() + adjustment * 3600000); // Convert hours to milliseconds
                }
            }
            [h, slope, a] = this.heightAndCurrentAt(currentTime);
            iterations++;
        }
        
        if (Math.abs(h - height) < ACCEPTABLE_ERROR) {
            return [currentTime, slope > 0];
        }
        return false;
    }

    // returns [time, height, max?] or false
    solveForExtremeNear(time: Date): [Date, number, boolean] | false {
        const ACCEPTABLE_ERROR = 0.0001;
        let iterations = 0;
        let currentTime = new Date(time.getTime());
        let [h, slope, a] = this.heightAndCurrentAt(currentTime);
        
        while (iterations < 30 && Math.abs(slope) > ACCEPTABLE_ERROR) {
            // solve for derivative = 0
            // y - slope = a(x - time); solve for x where y = 0
            // slope = a(time - x)
            // slope/a = time - x
            // x = time - slope/a
            currentTime = new Date(currentTime.getTime() - slope/a * 3600000); // Convert hours to milliseconds
            [h, slope, a] = this.heightAndCurrentAt(currentTime);
            iterations++;
        }
        
        if (Math.abs(slope) < ACCEPTABLE_ERROR) {
            return [currentTime, h, a < 0];
        }
        return false;
    }

    // returns [time, height] or false
    solveForExtremeBetween(begin: Date, end: Date, lookForMax = true): [Date, number] | false {
        let iterations = 0;
        const spanMs = end.getTime() - begin.getTime();
        
        while (iterations < 50) {
            iterations++;
            const randomTime = new Date(begin.getTime() + Math.random() * spanMs);
            const foundVal = this.solveForExtremeNear(randomTime);
            
            if (foundVal) {
                const [time, h, foundMax] = foundVal;
                if (time < end && time > begin && foundMax === lookForMax) {
                    return [time, h];
                }
            }
        }
        return false;
    }

    solveForTideAtHeightBetween(begin: Date, end: Date, height: number, goingIn = true): Date | false {
        let iterations = 0;
        const spanMs = end.getTime() - begin.getTime();
        
        while (iterations < 60) {
            iterations++;
            const randomTime = new Date(begin.getTime() + Math.random() * spanMs);
            const foundValues = this.solveForTideAtHeightNear(randomTime, height);
            
            if (foundValues) {
                const [time, direction] = foundValues;
                if (time > begin && time < end && direction === goingIn) {
                    return time;
                }
            }
        }
        return false;
    }

    // returns [start, end, highTime, highHeight] or [false, false, highTime, highHeight] or false
    findNOGO(height: number, year: number, month: number, day: number, am = true): [Date | false, Date | false, Date, number] | false {
        const hour = am ? 0 : 12;
        // find high tide
        const before = new Date(year, month - 1, day, hour, 0, 0); // Month is 0-based in JS Date
        const after = new Date(before.getTime() + 12 * 3600000); // 12 hours in milliseconds
        
        const highTime = this.solveForExtremeBetween(before, after);
        if (!highTime) {
            return false;
        }
        
        const [highTimeDate, highHeight] = highTime;
        if (height > highHeight) {
            return [false, false, highTimeDate, highHeight];
        }
        
        const beforeSearch = new Date(highTimeDate.getTime() - 12 * 3600000);
        const afterSearch = new Date(highTimeDate.getTime() + 12 * 3600000);
        
        const start = this.solveForTideAtHeightBetween(beforeSearch, highTimeDate, height, true);
        let end: Date | false = false;
        
        if (start) {
            end = this.solveForTideAtHeightBetween(highTimeDate, afterSearch, height, false);
        }
        
        return [start, end, highTimeDate, highHeight];
    }
}

// These are the NOAA constituents, in the order presented on their website.
const constituents = noaa.filter(c => c !== _Z0);

// Phases and amplitudes (relative to GMT and in degrees and metres)
// Data for provincetown from http://www.tidesandcurrents.noaa.gov/harcon.html?unit=0&timezone=0&id=8446121&name=Provincetown&state=MA
const published_amplitudes = [1.367, 0.175, 0.323, 0.136, 0.022, 0.119, 0.040, 0.005, 0.001, 0.010, 0.072, 0.001, 0.004, 0.032, 0.005, 0.020, 0.005, 0.007, 0.009, 0.0, 0.018, 0.032, 0.0, 0.0, 0.003, 0.018, 0.011, 0.0, 0.002, 0.043, 0.002, 0.004, 0.081, 0.007, 0.070, 0.001, 0.007];
const published_phases = [112.0, 151.3, 78.80, 206.1, 9.700, 187.9, 294.6, 245.8, 102.7, 351.1, 91.90, 157.6, 56.50, 74.70, 235.5, 141.9, 221.2, 201.7, 211.9, 0.0, 89.80, 126.3, 0.0, 0.0, 194.4, 172.0, 96.90, 0.0, 198.3, 201.7, 102.2, 152.2, 170.3, 216.6, 138.8, 48.60, 55.60];

// We can add a constant offset (e.g. for a different datum, we will use relative to MLLW):
const MTL = 2.286;
const MLLW = 0.718;
const offset = MTL - MLLW;
constituents.push(_Z0);
published_phases.push(0);
published_amplitudes.push(offset);

export const tide = new Tide(constituents, published_amplitudes, published_phases); 