from datetime import datetime, timedelta
import pytz
from random import randint
import math as m

from tide import _Z0, d2r, astro, simpleAstro, noaa

delta = 0.02
deltaT = timedelta(hours = delta)

# given vector of numbers, multiply each by scalar number
def vecTimesScalar(scal, vec):
    return [v*scal for v in vec]
def modEach360(vec):
    return [v%360.0 for v in vec]

def getSeconds(td):
    return (td.microseconds + (td.seconds + td.days * 24.0 * 3600.0) * 10**6) / 10**6

utc = pytz.utc
eastern_time = pytz.timezone('America/New_York')

def toLocalTime(atime):
    return atime.replace(tzinfo=utc).astimezone(eastern_time)
def toGMT(atime):
    return atime.replace(tzinfo=eastern_time).astimezone(utc)

class Tide(object):

    def __init__(self, constituents, amplitudes, phases):
        self.phases = vecTimesScalar(d2r, phases)
        self.amplitudes = amplitudes
        self.constituents = constituents
        # store these values to be used often, hopefully will increase speed
        # set to None before making a calculation at a much different time
        self.speed = None
        self.u = None
        self.f = None

    def prepare(self, t0):
        constituents = self.constituents
        #The equilibrium argument is constant and taken at the beginning of the
        #time series (t0).  The speed of the equilibrium argument changes very
        #slowly, so again we take it to be constant over any length of data. The
        #node factors change more rapidly.
        a0 = simpleAstro(t0)
        #For convenience give u, V0 (but not speed!) in [0, 360)
        V0 = vecTimesScalar(d2r, [c.V(a0) for c in constituents])

        if self.speed == None or self.u == None or self.f == None:
            a0 = astro(t0)
            self.speed = vecTimesScalar(d2r, [c.speed(a0) for c in constituents])
            self.u = vecTimesScalar(d2r, modEach360([c.u(a0) for c in constituents]))
            self.f = modEach360([c.f(a0) for c in constituents])

        return self.speed, self.u, self.f, V0

    def at(self, t):
        t0 = t[0]
        hours = [getSeconds(ti-t0) / 3600.0 for ti in t] # just use offset from first
        speed, u, f, V0 = self.prepare(t0)
        return Tide._tidal_series(hours, self.amplitudes, self.phases, speed, u, f, V0)

    @staticmethod
    def _tidal_series(t, amplitude, phase, speed, u, f, V0):
        # t is an array with the times, starting at t0. so [0 6] for two times six hours apart
        # amplitude is an array of values direct from input amplitude.
        # phase is in radians
        # speed is 2pi/period (radians per hour)
        # f, u, and V0 are all from the constituents. they just depend on time
        # here they are constant for each constituent
        heights = [] # will be same length as t
        for i in range(len(t)):
            heights.append(0)
            for j in range(len(amplitude)):
                heights[i] += amplitude[j] * f[j] * m.cos(speed[j]*t[i] + V0[j] + u[j] - phase[j])
        return heights

    # gets derivative and values of the tide at a given date
    # also gives second derivative
    # result is in (meters, meters / hour, meters / hour^2)
    # use for Newton's method
    def heightAndCurrentAt(self, time):
        beforeAndAfter = [time-2*deltaT, time-deltaT, time, time+deltaT, time+2*deltaT]
        heightsBeforeAndAfter = self.at(beforeAndAfter)
        height = heightsBeforeAndAfter[2]
        d2 = 2*delta
        deriv = (heightsBeforeAndAfter[3]-heightsBeforeAndAfter[1]) / d2
        derivBefore = (heightsBeforeAndAfter[2]-heightsBeforeAndAfter[0]) / d2
        derivAfter = (heightsBeforeAndAfter[4]-heightsBeforeAndAfter[2]) / d2
        secondDeriv = (derivAfter - derivBefore) / d2
        return (height, deriv, secondDeriv)

    # given an approximate time and height goal, find where the tide is that height (near that time, hopefully)
    # returns False if not found (got stuck in a local min/max or something) or (time, GoingInBoolean) otherwise
    def solveForTideAtHeightNear(self, time, height):
        ACCEPTABLE_ERROR = 0.0001
        iterations = 0
        h, slope, a = self.heightAndCurrentAt(time)
        while iterations < 50 and abs(h - height) > ACCEPTABLE_ERROR:
            # height = h + m(t - time) + a(t - time)^2/2
            # height = h + mT + aT^2/2
            # solve for T, then t = T + time
            # 0 = (a/2)T^2 + (m)T + (h - height)
            if abs(a) < 0.0001:
                # 0 = (m) T + (h - height)
                # T = (height - h)/m
                time = timedelta(hours = (height - h) / slope) + time
            else:
                # T = (-m \pm sqrt(m^2 + 2a(height - h))) / (a)
                discriminant = slope*slope + 2*a*(height - h)
                if discriminant < 0:
                    return False
                else:
                    side1 = (-slope + m.sqrt(discriminant)) / a
                    side2 = (-slope - m.sqrt(discriminant)) / a
                    if abs(side1) < abs(side2):
                        time += timedelta(hours = side1)
                    else:
                        time += timedelta(hours = side2)
            h, slope, a = self.heightAndCurrentAt(time)
            iterations+=1
        if abs(h - height) < ACCEPTABLE_ERROR:
            return (time, slope > 0)
        return False

    # returns (time, height, max?)
    def solveForExtremeNear(self, time):
        ACCEPTABLE_ERROR = 0.0001
        iterations = 0
        h, slope, a = self.heightAndCurrentAt(time)
        while iterations < 30 and abs(slope) > ACCEPTABLE_ERROR:
            # solve for derivative = 0
            # y - slope = a(x - time); solve for x where y = 0
            # slope = a(time - x)
            # slope/a = time - x
            # x = time - slope/a
            time -= timedelta(hours = slope/a)
            h, slope, a = self.heightAndCurrentAt(time)
            iterations+=1
        if abs(slope) < ACCEPTABLE_ERROR:
            return (time, h, a < 0)
        return False

    # returns (time, height)
    def solveForExtremeBetween(self, begin, end, lookForMax = True):
        iterations = 0
        spanSecs = int(getSeconds(end - begin))
        while iterations < 50:
            iterations+=1
            randomTime = timedelta(seconds=randint(0, spanSecs)) + begin
            foundVal = self.solveForExtremeNear(randomTime)
            if foundVal != False:
                time, h, foundMax = foundVal
                if time < end and time > begin and foundMax == lookForMax:
                    return (time, h)
        return False

    def solveForTideAtHeightBetween(self, begin, end, height, goingIn = True):
        iterations = 0
        spanSecs = int(getSeconds(end - begin))
        while iterations < 60:
            iterations+=1
            randomTime = timedelta(seconds=randint(0, spanSecs)) + begin
            foundValues = self.solveForTideAtHeightNear(randomTime, height)
            if foundValues != False:
                time, direction = foundValues
                if time > begin and time < end and direction==goingIn:
                    return time
        return False

    # returns (start, end, highTime, highHeight) or False
    def findNOGO(self, height, year, month, day, am = True):
        hour = 12
        if am:
            hour = 0
        # find high tide
        before = toGMT(datetime(year, month, day, hour, 0, 0))
        after = before + timedelta(hours = 12)
        highTime = self.solveForExtremeBetween(before, after)
        if highTime == False:
            return False
        highTime, highHeight = highTime
        if height > highHeight:
            return False, False, highTime, highHeight
        before = highTime - timedelta(hours = 12)
        after = highTime + timedelta(hours = 12)
        start = self.solveForTideAtHeightBetween(before, highTime, height, True)
        end = False
        if start != False:
            end = self.solveForTideAtHeightBetween(highTime, after, height, False)
        return start, end, highTime, highHeight

#These are the NOAA constituents, in the order presented on their website.
constituents = [c for c in noaa if c != _Z0]

#Phases and amplitudes (relative to GMT and in degrees and metres)
#published_phases = [115.7,140.7,92.6,192,145.5,220.6,159.9,202.8,152.3,117.2,92,0,0,69.7,224.5,141.7,121.9,
#228.4,252.1,0,60.1,135.5,0,0,204.5,212.2,112.3,141.8,249.1,211.1,75.1,181.4,140.4,202.4,141.8,155,160.9]
# Data for provincetown from http://www.tidesandcurrents.noaa.gov/harcon.html?unit=0&timezone=0&id=8446121&name=Provincetown&state=MA
published_amplitudes = [1.367, 0.175, 0.323, 0.136, 0.022, 0.119, 0.040, 0.005, 0.001, 0.010, 0.072, 0.001, 0.004, 0.032, 0.005, 0.020, 0.005, 0.007, 0.009, 0.0, 0.018, 0.032, 0.0, 0.0, 0.003, 0.018, 0.011, 0.0, 0.002, 0.043, 0.002, 0.004, 0.081, 0.007, 0.070, 0.001, 0.007]
published_phases =     [112.0, 151.3, 78.80, 206.1, 9.700, 187.9, 294.6, 245.8, 102.7, 351.1, 91.90, 157.6, 56.50, 74.70, 235.5, 141.9, 221.2, 201.7, 211.9, 0.0, 89.80, 126.3, 0.0, 0.0, 194.4, 172.0, 96.90, 0.0, 198.3, 201.7, 102.2, 152.2, 170.3, 216.6, 138.8, 48.60, 55.60]
assert(len(published_phases) == len(published_amplitudes))
#We can add a constant offset (e.g. for a different datum, we will use relative to MLLW):
MTL = 2.286
MLLW = 0.718
offset = MTL - MLLW
constituents.append(_Z0)
published_phases.append(0)
published_amplitudes.append(offset)

tide = Tide(constituents, published_amplitudes, published_phases)