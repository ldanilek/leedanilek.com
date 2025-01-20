#!/usr/bin/python

from datetime import datetime, timedelta
import pytz
from calendar import monthrange
from collections import namedtuple
from random import randint
import string
import operator as op
import math as m
import cgi

d2r, r2d = m.pi/180.0, 180.0/m.pi

daylight = True

#The following functions take a dictionary of astronomical values (in degrees)
#and return dimensionless scale factors for constituent amplitudes.

def f_unity(a):
    return 1.0

#Schureman equations 73, 65
def f_Mm(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    mean = (2/3.0 - m.sin(omega)**2)*(1 - 3/2.0 * m.sin(i)**2)
    return (2/3.0 - m.sin(I)**2) / mean

#Schureman equations 74, 66
def f_Mf(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    mean = m.sin(omega)**2 * m.cos(0.5*i)**4
    return m.sin(I)**2 / mean

#Schureman equations 75, 67
def f_O1(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    mean = m.sin(omega) * m.cos(0.5*omega)**2 * m.cos(0.5*i)**4
    return (m.sin(I) * m.cos(0.5*I)**2) / mean

#Schureman equations 76, 68
def f_J1(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    mean = m.sin(2*omega) * (1-3/2.0 * m.sin(i)**2)
    return m.sin(2*I) / mean

#Schureman equations 77, 69
def f_OO1(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    mean = m.sin(omega) * m.sin(0.5*omega)**2 * m.cos(0.5*i)**4
    return m.sin(I) * m.sin(0.5*I)**2 / mean

#Schureman equations 78, 70
def f_M2(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    mean = m.cos(0.5*omega)**4 * m.cos(0.5*i)**4
    return m.cos(0.5*I)**4 / mean

#Schureman equations 227, 226, 68
#Should probably eventually include the derivations of the magic numbers (0.5023 etc).
def f_K1(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    nu = d2r*a['nu'].value
    sin2Icosnu_mean = m.sin(2*omega) * (1-3/2.0 * m.sin(i)**2)
    mean = 0.5023*sin2Icosnu_mean + 0.1681
    return (0.2523*m.sin(2*I)**2 + 0.1689*m.sin(2*I)*m.cos(nu)+0.0283)**(0.5) / mean

#Schureman equations 215, 213, 204
#It can be (and has been) confirmed that the exponent for R_a reads 1/2 via Schureman Table 7
def f_L2(a):
    P = d2r*a['P'].value
    I = d2r*a['I'].value
    R_a_inv = (1 - 12*m.tan(0.5*I)**2 * m.cos(2*P)+36*m.tan(0.5*I)**4)**(0.5)
    return f_M2(a) * R_a_inv

#Schureman equations 235, 234, 71
#Again, magic numbers
def f_K2(a):
    omega = d2r*a['omega'].value
    i = d2r*a['i'].value
    I = d2r*a['I'].value
    nu = d2r*a['nu'].value
    sinsqIcos2nu_mean = m.sin(omega)**2 * (1-3/2.0 * m.sin(i)**2)
    mean = 0.5023*sinsqIcos2nu_mean + 0.0365
    return (0.2533*m.sin(I)**4 + 0.0367*m.sin(I)**2 *m.cos(2*nu)+0.0013)**(0.5) / mean

#Schureman equations 206, 207, 195
def f_M1(a):
    P = d2r*a['P'].value
    I = d2r*a['I'].value
    Q_a_inv = (0.25 + 1.5*m.cos(I)*m.cos(2*P)*m.cos(0.5*I)**(-0.5) + 2.25*m.cos(I)**2 * m.cos(0.5*I)**(-4))**(0.5)
    return f_O1(a) * Q_a_inv

#See e.g. Schureman equation 149
def f_Modd(a, n):
    return f_M2(a) ** (n / 2.0)

#Node factors u, see Table 2 of Schureman.

def u_zero(a):
    return 0.0

def u_Mf(a):
    return -2.0 * a['xi'].value

def u_O1(a):
    return 2.0 * a['xi'].value - a['nu'].value

def u_J1(a):
    return -a['nu'].value

def u_OO1(a):
    return -2.0 * a['xi'].value - a['nu'].value

def u_M2(a):
    return 2.0 * a['xi'].value - 2.0 * a['nu'].value

def u_K1(a):
    return -a['nup'].value

#Schureman 214
def u_L2(a):
    I = d2r*a['I'].value
    P = d2r*a['P'].value
    R = r2d*m.atan2(m.sin(2*P), 1/6.0 * m.tan(0.5*I) **(-2) -m.cos(2*P))
    return 2.0 * a['xi'].value - 2.0 * a['nu'].value - R

def u_K2(a):
    return -2.0 * a['nupp'].value

#Schureman 202
def u_M1(a):
    I = d2r*a['I'].value
    P = d2r*a['P'].value
    Q = r2d*m.atan2((5*m.cos(I)-1)*m.tan(P), 7*m.cos(I)+1)
    return a['xi'].value - a['nu'].value + Q

def u_Modd(a, n):
    return n/2.0 * u_M2(a)

# manual dot product, because can't use numpy
def dotProd(arr1, arr2):
    s = 0.0
    for i in range(len(arr1)):
        s += arr1[i]*arr2[i]
    return s

class BaseConstituent(object):

    def __init__(self, name, xdo='', coefficients=[], u=u_zero, f=f_unity):
        self.name = name
        self.xdo_int = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
            'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
            'R': -8, 'S': -7, 'T': -6, 'U': -5, 'V': -4, 'W': -3, 'X': -2, 'Y': -1,
            'Z': 0
        }
        self.int_xdo = {}
        for k in self.xdo_int:
            v = self.xdo_int[k]
            self.int_xdo[v] = k
        if xdo == '':
            self.coefficients = coefficients
        else:
            self.coefficients = self.xdo_to_coefficients(xdo)
        self.name = name
        self.u = u
        self.f = f

    def xdo_to_coefficients(self, xdo):
        return [self.xdo_int[l.upper()] for l in xdo if l in string.ascii_letters]

    def coefficients_to_xdo(self, coefficients):
        return ''.join([self.int_xdo[c] for c in cooefficients])

    def V(self, astro):
        return dotProd(self.coefficients, self.astro_values(astro))

    def xdo(self):
        return self.coefficients_to_xdo(self.coefficients)

    def speed(self, a):
        return dotProd(self.coefficients, self.astro_speeds(a))

    def astro_xdo(self, a):
        return [a['T+h-s'], a['s'], a['h'], a['p'], a['N'], a['pp'], a['90']]

    def astro_speeds(self, a):
        return [each.speed for each in self.astro_xdo(a)]

    def astro_values(self, a):
        return [each.value for each in self.astro_xdo(a)]

class CompoundConstituent(BaseConstituent):

    def __init__(self, members = [], **kwargs):
        self.members = members

        if 'u' not in kwargs:
            kwargs['u'] = self.u
        if 'f' not in kwargs:
            kwargs['f'] = self.f

        super(CompoundConstituent,self).__init__(**kwargs)

        self.coefficients = reduce(op.add,[c.coefficients * n for (c,n) in members])

    def speed(self, a):
        return reduce(op.add, [n * c.speed(a) for (c,n) in self.members])

    def V(self, a):
        return reduce(op.add, [n * c.V(a) for (c,n) in self.members])

    def u(self, a):
        return reduce(op.add, [n * c.u(a) for (c,n) in self.members])

    def f(self, a):
        return reduce(op.mul, [c.f(a) ** abs(n) for (c,n) in self.members])

###### Base Constituents
#Long Term
_Z0      = BaseConstituent(name = 'Z0',      xdo = 'Z ZZZ ZZZ', u = u_zero, f = f_unity)
_Sa      = BaseConstituent(name = 'Sa',      xdo = 'Z ZAZ ZZZ', u = u_zero, f = f_unity)
_Ssa     = BaseConstituent(name = 'Ssa',     xdo = 'Z ZBZ ZZZ', u = u_zero, f = f_unity)
_Mm      = BaseConstituent(name = 'Mm',      xdo = 'Z AZY ZZZ', u = u_zero, f = f_Mm)
_Mf      = BaseConstituent(name = 'Mf',      xdo = 'Z BZZ ZZZ', u = u_Mf, f = f_Mf)

#Diurnals
_Q1      = BaseConstituent(name = 'Q1',      xdo = 'A XZA ZZA', u = u_O1, f = f_O1)
_O1      = BaseConstituent(name = 'O1',      xdo = 'A YZZ ZZA', u = u_O1, f = f_O1)
_K1      = BaseConstituent(name = 'K1',      xdo = 'A AZZ ZZY', u = u_K1, f = f_K1)
_J1      = BaseConstituent(name = 'J1',      xdo = 'A BZY ZZY', u = u_J1, f = f_J1)

#M1 is a tricky business for reasons of convention, rather than theory.  The
#reasons for this are best summarised by Schureman paragraphs 126, 127 and in
#the comments found in congen_input.txt of xtides, so I won't go over all this
#again here.

_M1      = BaseConstituent(name = 'M1',      xdo = 'A ZZZ ZZA', u = u_M1, f = f_M1)
_P1      = BaseConstituent(name = 'P1',      xdo = 'A AXZ ZZA', u = u_zero, f = f_unity)
_S1      = BaseConstituent(name = 'S1',      xdo = 'A AYZ ZZZ', u = u_zero, f = f_unity)
_OO1     = BaseConstituent(name = 'OO1',     xdo = 'A CZZ ZZY', u = u_OO1, f = f_OO1)

#Semi-Diurnals
_2N2     = BaseConstituent(name = '2N2',     xdo = 'B XZB ZZZ', u = u_M2, f = f_M2)
_N2      = BaseConstituent(name = 'N2',      xdo = 'B YZA ZZZ', u = u_M2, f = f_M2)
_nu2     = BaseConstituent(name = 'nu2',     xdo = 'B YBY ZZZ', u = u_M2, f = f_M2)
_M2      = BaseConstituent(name = 'M2',      xdo = 'B ZZZ ZZZ', u = u_M2, f = f_M2)
_lambda2 = BaseConstituent(name = 'lambda2', xdo = 'B AXA ZZB', u = u_M2, f = f_M2)
_L2      = BaseConstituent(name = 'L2',      xdo = 'B AZY ZZB', u = u_L2, f = f_L2)
_T2      = BaseConstituent(name = 'T2',      xdo = 'B BWZ ZAZ', u = u_zero, f = f_unity)
_S2      = BaseConstituent(name = 'S2',      xdo = 'B BXZ ZZZ', u = u_zero, f = f_unity)
_R2      = BaseConstituent(name = 'R2',      xdo = 'B BYZ ZYB', u = u_zero, f = f_unity)
_K2      = BaseConstituent(name = 'K2',      xdo = 'B BZZ ZZZ', u = u_K2, f = f_K2)

#Third-Diurnals
_M3      = BaseConstituent(name = 'M3',      xdo = 'C ZZZ ZZZ', u = lambda a: u_Modd(a,3), f = lambda a: f_Modd(a,3))

###### Compound Constituents
#Long Term
_MSF     = CompoundConstituent(name = 'MSF',  members = [(_S2, 1), (_M2, -1)])

#Diurnal
_2Q1     = CompoundConstituent(name = '2Q1',  members = [(_N2, 1), (_J1, -1)])
_rho1    = CompoundConstituent(name = 'rho1', members = [(_nu2, 1), (_K1, -1)])

#Semi-Diurnal

_mu2     = CompoundConstituent(name = 'mu2',  members = [(_M2, 2), (_S2, -1)]) #2MS2
_2SM2    = CompoundConstituent(name = '2SM2', members = [(_S2, 2), (_M2, -1)])

#Third-Diurnal
_2MK3    = CompoundConstituent(name = '2MK3', members = [(_M2, 1), (_O1, 1)])
_MK3     = CompoundConstituent(name = 'MK3',  members = [(_M2, 1), (_K1, 1)])

#Quarter-Diurnal
_MN4     = CompoundConstituent(name = 'MN4',  members = [(_M2, 1), (_N2, 1)])
_M4      = CompoundConstituent(name = 'M4',   members = [(_M2, 2)])
_MS4     = CompoundConstituent(name = 'MS4',  members = [(_M2, 1), (_S2, 1)])
_S4      = CompoundConstituent(name = 'S4',   members = [(_S2, 2)])

#Sixth-Diurnal
_M6      = CompoundConstituent(name = 'M6',   members = [(_M2, 3)])
_S6      = CompoundConstituent(name = 'S6',   members = [(_S2, 3)])

#Eighth-Diurnals
_M8      = CompoundConstituent(name = 'M8',   members = [(_M2, 4)])


noaa = [
    _M2, _S2, _N2, _K1, _M4, _O1, _M6, _MK3, _S4, _MN4, _nu2, _S6, _mu2,
    _2N2, _OO1, _lambda2, _S1, _M1, _J1, _Mm, _Ssa, _Sa, _MSF, _Mf,
    _rho1, _Q1, _T2, _R2, _2Q1, _P1, _2SM2, _M3, _L2, _2MK3, _K2,
    _M8, _MS4
]

# Most of this is based around Meeus's Astronomical Algorithms, since it
# presents reasonably good approximations of all the quantities we require in a
# clear fashion.  Reluctant to go all out and use VSOP87 unless it can be shown
# to make a significant difference to the resulting accuracy of harmonic
# analysis.

#Convert a sexagesimal angle into decimal degrees
def s2d(degrees, arcmins = 0, arcsecs = 0, mas = 0, muas = 0):
    return (
            degrees
            + (arcmins /  60.0)
            + (arcsecs / (60.0*60.0))
            + (mas       / (60.0*60.0*1e3))
            + (muas    / (60.0*60.0*1e6))
    )

#Evaluate a polynomial at argument
def polynomial(coefficients, argument):
    return sum([c * (argument ** i) for i,c in enumerate(coefficients)])

#Evaluate the first derivative of a polynomial at argument
def d_polynomial(coefficients, argument):
    return sum([c * i * (argument ** (i-1)) for i,c in enumerate(coefficients)])

#Meeus formula 11.1
def T(t):
    return (JD(t) - 2451545.0)/36525

#Meeus formula 7.1
def JD(t):
    Y, M = t.year, t.month
    D = (
        t.day
        + t.hour / (24.0)
        + t.minute / (24.0*60.0)
        + t.second / (24.0*60.0*60.0)
        + t.microsecond / (24.0 * 60.0 * 60.0 * 1e6)
    )
    if M <= 2:
        Y = Y - 1
        M = M + 12
    A = m.floor(Y / 100.0)
    B = 2 - A + m.floor(A / 4.0)
    return m.floor(365.25*(Y+4716)) + m.floor(30.6001*(M+1)) + D + B - 1524.5

#Meeus formula 21.3
terrestrial_obliquity_coefficients = (
    s2d(23,26,21.448),
    -s2d(0,0,4680.93),
    -s2d(0,0,1.55),
    s2d(0,0,1999.25),
    -s2d(0,0,51.38),
    -s2d(0,0,249.67),
    -s2d(0,0,39.05),
    s2d(0,0,7.12),
    s2d(0,0,27.87),
    s2d(0,0,5.79),
    s2d(0,0,2.45)
)

#Adjust these coefficients for parameter T rather than U
terrestrial_obliquity_coefficients = [
    c * (1e-2) ** i for i,c in enumerate(terrestrial_obliquity_coefficients)
]

#Not entirely sure about this interpretation, but this is the difference
#between Meeus formulae 24.2 and 24.3 and seems to work
solar_perigee_coefficients = (
    280.46645 - 357.52910,
    36000.76932 - 35999.05030,
    0.0003032 + 0.0001559,
    0.00000048
)

#Meeus formula 24.2
solar_longitude_coefficients = (
    280.46645,
    36000.76983,
    0.0003032
)

#This value is taken from JPL Horizon and is essentially constant
lunar_inclination_coefficients = (
    5.145,
)

#Meeus formula 45.1
lunar_longitude_coefficients = (
    218.3164591,
    481267.88134236,
    -0.0013268,
    1/538841.0
    -1/65194000.0
)

#Meeus formula 45.7
lunar_node_coefficients = (
    125.0445550,
    -1934.1361849,
    0.0020762,
    1/467410.0,
    -1/60616000.0
)

#Meeus, unnumbered formula directly preceded by 45.7
lunar_perigee_coefficients = (
    83.3532430,
    4069.0137111,
    -0.0103238,
    -1/80053.0,
    1/18999000.0
)

#Now follow some useful auxiliary values, we won't need their speed.
#See notes on Table 6 in Schureman for I, nu, xi, nu', 2nu''
def _I(N, i, omega):
    N, i, omega = d2r * N, d2r*i, d2r*omega
    cosI = m.cos(i)*m.cos(omega)-m.sin(i)*m.sin(omega)*m.cos(N)
    return r2d*m.acos(cosI)

def _xi(N, i, omega):
    N, i, omega = d2r * N, d2r*i, d2r*omega
    e1 = m.cos(0.5*(omega-i))/m.cos(0.5*(omega+i)) * m.tan(0.5*N)
    e2 = m.sin(0.5*(omega-i))/m.sin(0.5*(omega+i)) * m.tan(0.5*N)
    e1, e2 = m.atan(e1), m.atan(e2)
    e1, e2 = e1 - 0.5*N, e2 - 0.5*N
    return -(e1 + e2)*r2d

def _nu(N, i, omega):
    N, i, omega = d2r * N, d2r*i, d2r*omega
    e1 = m.cos(0.5*(omega-i))/m.cos(0.5*(omega+i)) * m.tan(0.5*N)
    e2 = m.sin(0.5*(omega-i))/m.sin(0.5*(omega+i)) * m.tan(0.5*N)
    e1, e2 = m.atan(e1), m.atan(e2)
    e1, e2 = e1 - 0.5*N, e2 - 0.5*N
    return (e1 - e2)*r2d

#Schureman equation 224
#Can we be more precise than B "the solar coefficient" = 0.1681?
def _nup(N, i, omega):
    I = d2r * _I(N, i, omega)
    nu = d2r * _nu(N, i, omega)
    return r2d * m.atan2(m.sin(2*I)*m.sin(nu), (m.sin(2*I)*m.cos(nu)+0.3347))

#Schureman equation 232
def _nupp(N, i, omega):
    I = d2r * _I(N, i, omega)
    nu = d2r * _nu(N, i, omega)
    tan2nupp = (m.sin(I)**2*m.sin(2*nu))/(m.sin(I)**2*m.cos(2*nu)+0.0727)
    return r2d * 0.5 * m.atan(tan2nupp)

AstronomicalParameter = namedtuple('AstronomicalParameter', ['value', 'speed'])

#We can use polynomial fits from Meeus to obtain good approximations to
#some astronomical values (and therefore speeds).
polynomials = {
        's':     lunar_longitude_coefficients,
        'h':     solar_longitude_coefficients,
        'p':     lunar_perigee_coefficients,
        'N':     lunar_node_coefficients,
        'pp':    solar_perigee_coefficients,
        '90':    (90.0,),
}
otherPolynomials = {
        'omega': terrestrial_obliquity_coefficients,
        'i':     lunar_inclination_coefficients
}

def astro(t):
    a = {}

    #Polynomials are in T, that is Julian Centuries; we want our speeds to be
    #in the more convenient unit of degrees per hour.
    dT_dHour = 1 / (24 * 365.25 * 100)
    computedT = T(t)
    for name, coefficients in polynomials.items():
        a[name] = AstronomicalParameter(
                polynomial(coefficients, computedT) % 360.0,
                d_polynomial(coefficients, computedT) * dT_dHour
        )
    for name, coefficients in otherPolynomials.items():
        a[name] = AstronomicalParameter(
                polynomial(coefficients, computedT) % 360.0,
                d_polynomial(coefficients, computedT) * dT_dHour
        )

    #Some other parameters defined by Schureman which are dependent on the
    #parameters N, i, omega for use in node factor calculations. We don't need
    #their speeds.
    args = list(each.value for each in [a['N'], a['i'], a['omega']])
    for name, function in {
        'I':    _I,
        'xi':   _xi,
        'nu':   _nu,
        'nup':  _nup,
        'nupp': _nupp
    }.items():
        a[name] = AstronomicalParameter(function(*args) % 360.0, None)

    #We don't work directly with the T (hours) parameter, instead our spanning
    #set for equilibrium arguments #is given by T+h-s, s, h, p, N, pp, 90.
    #This is in line with convention.
    hour = AstronomicalParameter((JD(t) - m.floor(JD(t))) * 360.0, 15.0)
    a['T+h-s'] = AstronomicalParameter(
        hour.value + a['h'].value - a['s'].value,
        hour.speed + a['h'].speed - a['s'].speed
    )
    #It is convenient to calculate Schureman's P here since several node
    #factors need it, although it could be argued that these
    #(along with I, xi, nu etc) belong somewhere else.
    a['P'] = AstronomicalParameter(
        (a['p'].value -a['xi'].value) % 360.0,
        None
    )
    return a

# make an astro for the V function faster by preparing for it
def simpleAstro(t):
    # will only need to access the values of
    # [a['T+h-s'], a['s'], a['h'], a['p'], a['N'], a['pp'], a['90']]
    # do not include speeds or other dictionary entries
    a = {}

    #Polynomials are in T, that is Julian Centuries; we want our speeds to be
    #in the more convenient unit of degrees per hour.
    dT_dHour = 1 / (24 * 365.25 * 100)
    JDT = JD(t)
    computedT = (JDT - 2451545.0)/36525
    for name, coefficients in polynomials.items():
        a[name] = AstronomicalParameter(
                polynomial(coefficients, computedT) % 360.0, 0
        )

    #We don't work directly with the T (hours) parameter, instead our spanning
    #set for equilibrium arguments #is given by T+h-s, s, h, p, N, pp, 90.
    #This is in line with convention.
    hour = (JDT - m.floor(JDT)) * 360.0
    a['T+h-s'] = AstronomicalParameter(hour + a['h'].value - a['s'].value, 0)
    return a

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
    offset = 5
    if daylight:
        offset = 4
    return atime - timedelta(hours = offset)
def toGMT(atime):
    return atime.replace(tzinfo=eastern_time).astimezone(utc)
    offset = 5
    if daylight:
        offset = 4
    return atime + timedelta(hours = offset)
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
    # even if found form, sends daylight only if on
    daylight = form.has_key("daylight") and form["daylight"].value == "on"

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

def makeICSFile():
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
icsFile = makeICSFile()

print "Content-type: text/html\n\n";
print "<html><head>";
print "<title>Wellfleet Tides</title>";
print "<style>th {"+"text-align:center;border:1px solid black;"+"}"
print "table {"+"width:100%;border:1px solid black;border-collapse:collapse;"+"}"
print "td {"+"text-align:center;border:1px solid black;"+"}"
print "h1 {"+"text-align:center;"+"}"
print "#formdiv {"+"text-align:right;"+"}"
print ".submitbutton {"+"margin:0 auto;margin-bottom: 10px;width:100px;"+"}"
print "form {"+"margin: 0 auto; width:300px;"+"}"
print ".small {"+"font-size:11px;"+"}"
print "@media print{"
print ".no-print, .no-print *{display: none !important;}"
print "tr {"+"background-color:white;color:black;"+"}"
print "}"
print ".highlight {"+"background-color:yellow;"+"}"
print "tr.hh:hover {"+"background-color:#99FF99;"+"}" ## class hh for highlighting on hover
print ".no-show {"+"display: none !important;}"
print "</style>"
print "<script>"
print """
function download(form) {
    text = form["text"].value;
    window.open( "data:text/calendar;charset=utf8," + escape(text));
    return false;
}"""
print "</script>"
print "</head><body>";

print "<h1>Lieutenant Island Tide Chart</h1>"

#print "<p>Current date is "+str(datetime(2015,5,19,1,0,0))+"</p>";

print "<div id='formdiv' class='no-print'>"
print "<form action='tide.py' method='GET'>"
print "Year: <input type='text' value='"+str(year)+"' name='year'><br />"
print "Month: <input type='text' value='"+str(month)+"' name='month'><br />"
print "Height cutoff (ft): <input type='text' value='"+str(NOGOHEIGHT)+"' name='height'><br />"
daylightChecked = ""
if daylight:
    daylightChecked = "checked"
print "Daylight savings: <input type='checkbox' name='daylight' "+daylightChecked+"><br />"
print "<div class='submitbutton'><input type='submit' value='Submit'></div>"
print "</form>"
print "</div>"

print "<div id='tablediv'>"


print nogoTable
print "</div>"

print """
<form onsubmit="return download(this);" class='no-print'>
  <textarea name="text" class='no-show'>"""+icsFile+"""</textarea>
  <div class='submitbutton'><input type="submit" value="Download NO GO Calendar"></div>
</form>"""
print "<p class='no-print'>After download, rename file so it has a .ics extension. Then you can drag it to the Calendar app in the dock or import it into a Google calendar.</p>"
print "<h4 class='no-print'>About</h4>"
print "<p class='no-print'>Uses data from Provincetown (not Wellfleet). Provincetown is hopefully the best <a href='http://tidesandcurrents.noaa.gov/harmonic.html'>harmonic</a> station to approximate Wellfleet's tides. For a list of other harmonic stations see <a href='http://www.tidesandcurrents.noaa.gov/stations.html?type=Harmonic+Constituents'>NOAA's list</a>. "
print "<p class='no-print'>Note there is some randomness in the calculation, so refreshing the page can yield slightly different results.</p>";
print "<p class='no-print'>Developed by Lee Danilek. Please <a href='mailto:iwork96+tide@gmail.com'>email the developer</a> with bug reports, comments, etc.</p>"
print "<p class='no-print'>Calculations are based on source code of Pytides, with code rewritten so it can be run online. Tide constants data are from <a href='tidesandcurrents.noaa.gov'>noaa.gov</a></p>"

print "</body></html>";
