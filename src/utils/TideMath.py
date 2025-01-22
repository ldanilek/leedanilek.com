
from collections import namedtuple
import string
import operator as op
import math as m

d2r, r2d = m.pi/180.0, 180.0/m.pi

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
        return ''.join([self.int_xdo[c] for c in coefficients])

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