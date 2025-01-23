// Type definitions for astronomical parameters and calculations
interface AstronomicalParameter {
  value: number;
  speed: number | null;
}

// Constants
export const d2r: number = Math.PI / 180.0;
export const r2d: number = 180.0 / Math.PI;

// The following functions take a dictionary of astronomical values (in degrees)
// and return dimensionless scale factors for constituent amplitudes.

function f_unity(_a: Record<string, AstronomicalParameter>): number {
  return 1.0;
}

// Schureman equations 73, 65
function f_Mm(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const mean = (2/3.0 - Math.sin(omega)**2) * (1 - 3/2.0 * Math.sin(i)**2);
  return (2/3.0 - Math.sin(I)**2) / mean;
}

// Schureman equations 74, 66
function f_Mf(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const mean = Math.sin(omega)**2 * Math.cos(0.5*i)**4;
  return Math.sin(I)**2 / mean;
}

// Schureman equations 75, 67
function f_O1(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const mean = Math.sin(omega) * Math.cos(0.5*omega)**2 * Math.cos(0.5*i)**4;
  return (Math.sin(I) * Math.cos(0.5*I)**2) / mean;
}

// Schureman equations 76, 68
function f_J1(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const mean = Math.sin(2*omega) * (1-3/2.0 * Math.sin(i)**2);
  return Math.sin(2*I) / mean;
}

// Schureman equations 77, 69
function f_OO1(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const mean = Math.sin(omega) * Math.sin(0.5*omega)**2 * Math.cos(0.5*i)**4;
  return Math.sin(I) * Math.sin(0.5*I)**2 / mean;
}

// Schureman equations 78, 70
function f_M2(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const mean = Math.cos(0.5*omega)**4 * Math.cos(0.5*i)**4;
  return Math.cos(0.5*I)**4 / mean;
}

// Schureman equations 227, 226, 68
// Should probably eventually include the derivations of the magic numbers (0.5023 etc).
function f_K1(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const nu = d2r * a['nu'].value;
  const sin2Icosnu_mean = Math.sin(2*omega) * (1-3/2.0 * Math.sin(i)**2);
  const mean = 0.5023*sin2Icosnu_mean + 0.1681;
  return Math.sqrt(0.2523*Math.sin(2*I)**2 + 0.1689*Math.sin(2*I)*Math.cos(nu)+0.0283) / mean;
}

// Schureman equations 215, 213, 204
// It can be (and has been) confirmed that the exponent for R_a reads 1/2 via Schureman Table 7
function f_L2(a: Record<string, AstronomicalParameter>): number {
  const P = d2r * a['P'].value;
  const I = d2r * a['I'].value;
  const R_a_inv = Math.sqrt(1 - 12*Math.tan(0.5*I)**2 * Math.cos(2*P)+36*Math.tan(0.5*I)**4);
  return f_M2(a) * R_a_inv;
}

// Schureman equations 235, 234, 71
// Again, magic numbers
function f_K2(a: Record<string, AstronomicalParameter>): number {
  const omega = d2r * a['omega'].value;
  const i = d2r * a['i'].value;
  const I = d2r * a['I'].value;
  const nu = d2r * a['nu'].value;
  const sinsqIcos2nu_mean = Math.sin(omega)**2 * (1-3/2.0 * Math.sin(i)**2);
  const mean = 0.5023*sinsqIcos2nu_mean + 0.0365;
  return Math.sqrt(0.2533*Math.sin(I)**4 + 0.0367*Math.sin(I)**2 *Math.cos(2*nu)+0.0013) / mean;
}

// Schureman equations 206, 207, 195
function f_M1(a: Record<string, AstronomicalParameter>): number {
  const P = d2r * a['P'].value;
  const I = d2r * a['I'].value;
  const Q_a_inv = Math.sqrt(0.25 + 1.5*Math.cos(I)*Math.cos(2*P)*Math.cos(0.5*I)**(-0.5) + 2.25*Math.cos(I)**2 * Math.cos(0.5*I)**(-4));
  return f_O1(a) * Q_a_inv;
}

function f_Modd(a: Record<string, AstronomicalParameter>, n: number): number {
  return f_M2(a) ** (n / 2.0);
}

// Node factors u, see Table 2 of Schureman.
function u_zero(_a: Record<string, AstronomicalParameter>): number {
  return 0.0;
}

function u_Mf(a: Record<string, AstronomicalParameter>): number {
  return -2.0 * a['xi'].value;
}

function u_O1(a: Record<string, AstronomicalParameter>): number {
  return 2.0 * a['xi'].value - a['nu'].value;
}

function u_J1(a: Record<string, AstronomicalParameter>): number {
  return -a['nu'].value;
}

function u_OO1(a: Record<string, AstronomicalParameter>): number {
  return -2.0 * a['xi'].value - a['nu'].value;
}

function u_M2(a: Record<string, AstronomicalParameter>): number {
  return 2.0 * a['xi'].value - 2.0 * a['nu'].value;
}

function u_K1(a: Record<string, AstronomicalParameter>): number {
  return -a['nup'].value;
}

// Schureman 214
function u_L2(a: Record<string, AstronomicalParameter>): number {
  const I = d2r * a['I'].value;
  const P = d2r * a['P'].value;
  const R = r2d * Math.atan2(Math.sin(2*P), 1/6.0 * Math.tan(0.5*I)**(-2) - Math.cos(2*P));
  return 2.0 * a['xi'].value - 2.0 * a['nu'].value - R;
}

function u_K2(a: Record<string, AstronomicalParameter>): number {
  return -2.0 * a['nupp'].value;
}

// Schureman 202
function u_M1(a: Record<string, AstronomicalParameter>): number {
  const I = d2r * a['I'].value;
  const P = d2r * a['P'].value;
  const Q = r2d * Math.atan2((5*Math.cos(I)-1)*Math.tan(P), 7*Math.cos(I)+1);
  return a['xi'].value - a['nu'].value + Q;
}

function u_Modd(a: Record<string, AstronomicalParameter>, n: number): number {
  return n/2.0 * u_M2(a);
}

// manual dot product, because we want to keep the original implementation style
function dotProd(arr1: number[], arr2: number[]): number {
  let s = 0.0;
  for (let i = 0; i < arr1.length; i++) {
      s += arr1[i]*arr2[i];
  }
  return s;
}

export class BaseConstituent {
  name: string;
  coefficients: number[];
  private uFunc: (a: Record<string, AstronomicalParameter>) => number;
  private fFunc: (a: Record<string, AstronomicalParameter>) => number;
  private xdo_int: Record<string, number>;
  private int_xdo: Record<number, string>;

  constructor(
      name: string, 
      xdo: string = '', 
      coefficients: number[] = [], 
      uFunc: (a: Record<string, AstronomicalParameter>) => number = u_zero, 
      fFunc: (a: Record<string, AstronomicalParameter>) => number = f_unity
  ) {
      this.name = name;
      this.xdo_int = {
          'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
          'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
          'R': -8, 'S': -7, 'T': -6, 'U': -5, 'V': -4, 'W': -3, 'X': -2, 'Y': -1,
          'Z': 0
      };
      
      this.int_xdo = {};
      for (const [k, v] of Object.entries(this.xdo_int)) {
          this.int_xdo[v] = k;
      }

      if (xdo === '') {
          this.coefficients = coefficients;
      } else {
          this.coefficients = this.xdo_to_coefficients(xdo);
      }
      
      this.uFunc = uFunc;
      this.fFunc = fFunc;
  }

  private xdo_to_coefficients(xdo: string): number[] {
      return Array.from(xdo)
          .filter(l => /[a-zA-Z]/.test(l))
          .map(l => this.xdo_int[l.toUpperCase()]);
  }

  private coefficients_to_xdo(coefficients: number[]): string {
      return coefficients.map(c => this.int_xdo[c]).join('');
  }

  V(astro: Record<string, AstronomicalParameter>): number {
      return dotProd(this.coefficients, this.astro_values(astro));
  }

  xdo(): string {
      return this.coefficients_to_xdo(this.coefficients);
  }

  speed(a: Record<string, AstronomicalParameter>): number {
      return dotProd(this.coefficients, this.astro_speeds(a));
  }

  astro_xdo(a: Record<string, AstronomicalParameter>): AstronomicalParameter[] {
      return [a['T+h-s'], a['s'], a['h'], a['p'], a['N'], a['pp'], a['90']];
  }

  astro_speeds(a: Record<string, AstronomicalParameter>): number[] {
      return this.astro_xdo(a).map(each => each.speed || 0);
  }

  astro_values(a: Record<string, AstronomicalParameter>): number[] {
      return this.astro_xdo(a).map(each => each.value);
  }

  u(a: Record<string, AstronomicalParameter>): number {
      return this.uFunc(a);
  }

  f(a: Record<string, AstronomicalParameter>): number {
      return this.fFunc(a);
  }
}

class CompoundConstituent extends BaseConstituent {
  members: [BaseConstituent, number][];

  constructor(options: {
      name: string;
      members: [BaseConstituent, number][];
  }) {
      const { name, members } = options;
      super(name);
      this.members = members;
      this.coefficients = this.calculateCoefficients();
  }

  private calculateCoefficients(): number[] {
      return this.members.reduce((acc: number[], [c, n]) => {
          return acc.map((val, idx) => val + c.coefficients[idx] * n);
      }, new Array(7).fill(0));
  }

  override speed(a: Record<string, AstronomicalParameter>): number {
      return this.members.reduce((sum, [c, n]) => sum + n * c.speed(a), 0);
  }

  override V(a: Record<string, AstronomicalParameter>): number {
      return this.members.reduce((sum, [c, n]) => sum + n * c.V(a), 0);
  }

  override u(a: Record<string, AstronomicalParameter>): number {
      return this.members.reduce((sum, [c, n]) => sum + n * c.u(a), 0);
  }

  override f(a: Record<string, AstronomicalParameter>): number {
      return this.members.reduce((prod, [c, n]) => prod * c.f(a) ** Math.abs(n), 1);
  }
}

//##### Base Constituents
//Long Term
export const _Z0 = new BaseConstituent('Z0', 'Z ZZZ ZZZ', [], u_zero, f_unity);
const _Sa = new BaseConstituent('Sa', 'Z ZAZ ZZZ', [], u_zero, f_unity);
const _Ssa = new BaseConstituent('Ssa', 'Z ZBZ ZZZ', [], u_zero, f_unity);
const _Mm = new BaseConstituent('Mm', 'Z AZY ZZZ', [], u_zero, f_Mm);
const _Mf = new BaseConstituent('Mf', 'Z BZZ ZZZ', [], u_Mf, f_Mf);

//Diurnals
const _Q1 = new BaseConstituent('Q1', 'A XZA ZZA', [], u_O1, f_O1);
const _O1 = new BaseConstituent('O1', 'A YZZ ZZA', [], u_O1, f_O1);
const _K1 = new BaseConstituent('K1', 'A AZZ ZZY', [], u_K1, f_K1);
const _J1 = new BaseConstituent('J1', 'A BZY ZZY', [], u_J1, f_J1);

//M1 is a tricky business for reasons of convention, rather than theory. The
//reasons for this are best summarised by Schureman paragraphs 126, 127 and in
//the comments found in congen_input.txt of xtides, so I won't go over all this
//again here.

const _M1 = new BaseConstituent('M1', 'A ZZZ ZZA', [], u_M1, f_M1);
const _P1 = new BaseConstituent('P1', 'A AXZ ZZA', [], u_zero, f_unity);
const _S1 = new BaseConstituent('S1', 'A AYZ ZZZ', [], u_zero, f_unity);
const _OO1 = new BaseConstituent('OO1', 'A CZZ ZZY', [], u_OO1, f_OO1);

//Semi-Diurnals
const _2N2 = new BaseConstituent('2N2', 'B XZB ZZZ', [], u_M2, f_M2);
const _N2 = new BaseConstituent('N2', 'B YZA ZZZ', [], u_M2, f_M2);
const _nu2 = new BaseConstituent('nu2', 'B YBY ZZZ', [], u_M2, f_M2);
const _M2 = new BaseConstituent('M2', 'B ZZZ ZZZ', [], u_M2, f_M2);
const _lambda2 = new BaseConstituent('lambda2', 'B AXA ZZB', [], u_M2, f_M2);
const _L2 = new BaseConstituent('L2', 'B AZY ZZB', [], u_L2, f_L2);
const _T2 = new BaseConstituent('T2', 'B BWZ ZAZ', [], u_zero, f_unity);
const _S2 = new BaseConstituent('S2', 'B BXZ ZZZ', [], u_zero, f_unity);
const _R2 = new BaseConstituent('R2', 'B BYZ ZYB', [], u_zero, f_unity);
const _K2 = new BaseConstituent('K2', 'B BZZ ZZZ', [], u_K2, f_K2);

//Third-Diurnals
const _M3 = new BaseConstituent('M3', 'C ZZZ ZZZ', [], (a) => u_Modd(a, 3), (a) => f_Modd(a, 3));

//##### Compound Constituents
//Long Term
const _MSF = new CompoundConstituent({
    name: 'MSF',
    members: [[_S2, 1], [_M2, -1]]
});

//Diurnal
const _2Q1 = new CompoundConstituent({
    name: '2Q1',
    members: [[_N2, 1], [_J1, -1]]
});
const _rho1 = new CompoundConstituent({
    name: 'rho1',
    members: [[_nu2, 1], [_K1, -1]]
});

//Semi-Diurnal
const _mu2 = new CompoundConstituent({
    name: 'mu2',
    members: [[_M2, 2], [_S2, -1]]
}); //_2MS2
const _2SM2 = new CompoundConstituent({
    name: '2SM2',
    members: [[_S2, 2], [_M2, -1]]
});

//Third-Diurnal
const _2MK3 = new CompoundConstituent({
    name: '2MK3',
    members: [[_M2, 1], [_O1, 1]]
});
const _MK3 = new CompoundConstituent({
    name: 'MK3',
    members: [[_M2, 1], [_K1, 1]]
});

//Quarter-Diurnal
const _MN4 = new CompoundConstituent({
    name: 'MN4',
    members: [[_M2, 1], [_N2, 1]]
});
const _M4 = new CompoundConstituent({
    name: 'M4',
    members: [[_M2, 2]]
});
const _MS4 = new CompoundConstituent({
    name: 'MS4',
    members: [[_M2, 1], [_S2, 1]]
});
const _S4 = new CompoundConstituent({
    name: 'S4',
    members: [[_S2, 2]]
});

//Sixth-Diurnal
const _M6 = new CompoundConstituent({
    name: 'M6',
    members: [[_M2, 3]]
});
const _S6 = new CompoundConstituent({
    name: 'S6',
    members: [[_S2, 3]]
});

//Eighth-Diurnals
const _M8 = new CompoundConstituent({
    name: 'M8',
    members: [[_M2, 4]]
});

export const noaa = [
    _M2, _S2, _N2, _K1, _M4, _O1, _M6, _MK3, _S4, _MN4, _nu2, _S6, _mu2,
    _2N2, _OO1, _lambda2, _S1, _M1, _J1, _Mm, _Ssa, _Sa, _MSF, _Mf,
    _rho1, _Q1, _T2, _R2, _2Q1, _P1, _2SM2, _M3, _L2, _2MK3, _K2,
    _M8, _MS4
];

// Most of this is based around Meeus's Astronomical Algorithms, since it
// presents reasonably good approximations of all the quantities we require in a
// clear fashion. Reluctant to go all out and use VSOP87 unless it can be shown
// to make a significant difference to the resulting accuracy of harmonic
// analysis.

// Convert a sexagesimal angle into decimal degrees
function s2d(degrees: number, arcmins: number = 0, arcsecs: number = 0, mas: number = 0, muas: number = 0): number {
    return (
        degrees
        + (arcmins / 60.0)
        + (arcsecs / (60.0*60.0))
        + (mas / (60.0*60.0*1e3))
        + (muas / (60.0*60.0*1e6))
    );
}

// Evaluate a polynomial at argument
function polynomial(coefficients: number[], argument: number): number {
    return coefficients.reduce((sum, c, i) => sum + c * (argument ** i), 0);
}

// Evaluate the first derivative of a polynomial at argument
function d_polynomial(coefficients: number[], argument: number): number {
    return coefficients.reduce((sum, c, i) => sum + c * i * (argument ** (i-1)), 0);
}

// Meeus formula 11.1
function T(t: Date): number {
    return (JD(t) - 2451545.0)/36525;
}

// Meeus formula 7.1
function JD(t: Date): number {
    let Y = t.getUTCFullYear();
    let M = t.getUTCMonth() + 1; // JavaScript months are 0-based
    const D = (
        t.getUTCDate()
        + t.getUTCHours() / 24.0
        + t.getUTCMinutes() / (24.0*60.0)
        + t.getUTCSeconds() / (24.0*60.0*60.0)
        + t.getUTCMilliseconds() / (24.0 * 60.0 * 60.0 * 1e3)
    );
    
    if (M <= 2) {
        Y = Y - 1;
        M = M + 12;
    }
    const A = Math.floor(Y / 100.0);
    const B = 2 - A + Math.floor(A / 4.0);
    return Math.floor(365.25*(Y+4716)) + Math.floor(30.6001*(M+1)) + D + B - 1524.5;
}

// Meeus formula 21.3
const terrestrial_obliquity_coefficients = [
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
];

// Adjust these coefficients for parameter T rather than U
const adjusted_terrestrial_obliquity_coefficients = terrestrial_obliquity_coefficients.map(
    (c, i) => c * (1e-2) ** i
);

// Not entirely sure about this interpretation, but this is the difference
// between Meeus formulae 24.2 and 24.3 and seems to work
const solar_perigee_coefficients = [
    280.46645 - 357.52910,
    36000.76932 - 35999.05030,
    0.0003032 + 0.0001559,
    0.00000048
];

// Meeus formula 24.2
const solar_longitude_coefficients = [
    280.46645,
    36000.76983,
    0.0003032
];

// This value is taken from JPL Horizon and is essentially constant
const lunar_inclination_coefficients = [
    5.145
];

// Meeus formula 45.1
const lunar_longitude_coefficients = [
    218.3164591,
    481267.88134236,
    -0.0013268,
    1/538841.0,
    -1/65194000.0
];

// Meeus formula 45.7
const lunar_node_coefficients = [
    125.0445550,
    -1934.1361849,
    0.0020762,
    1/467410.0,
    -1/60616000.0
];

// Meeus, unnumbered formula directly preceded by 45.7
const lunar_perigee_coefficients = [
    83.3532430,
    4069.0137111,
    -0.0103238,
    -1/80053.0,
    1/18999000.0
];

// Now follow some useful auxiliary values, we won't need their speed.
// See notes on Table 6 in Schureman for I, nu, xi, nu', 2nu''
function _I(N: number, i: number, omega: number): number {
    N = d2r * N;
    i = d2r * i;
    omega = d2r * omega;
    const cosI = Math.cos(i)*Math.cos(omega)-Math.sin(i)*Math.sin(omega)*Math.cos(N);
    return r2d*Math.acos(cosI);
}

function _xi(N: number, i: number, omega: number): number {
    N = d2r * N;
    i = d2r * i;
    omega = d2r * omega;
    const e1 = Math.cos(0.5*(omega-i))/Math.cos(0.5*(omega+i)) * Math.tan(0.5*N);
    const e2 = Math.sin(0.5*(omega-i))/Math.sin(0.5*(omega+i)) * Math.tan(0.5*N);
    const e1_adj = Math.atan(e1) - 0.5*N;
    const e2_adj = Math.atan(e2) - 0.5*N;
    return -(e1_adj + e2_adj)*r2d;
}

function _nu(N: number, i: number, omega: number): number {
    N = d2r * N;
    i = d2r * i;
    omega = d2r * omega;
    const e1 = Math.cos(0.5*(omega-i))/Math.cos(0.5*(omega+i)) * Math.tan(0.5*N);
    const e2 = Math.sin(0.5*(omega-i))/Math.sin(0.5*(omega+i)) * Math.tan(0.5*N);
    const e1_adj = Math.atan(e1) - 0.5*N;
    const e2_adj = Math.atan(e2) - 0.5*N;
    return (e1_adj - e2_adj)*r2d;
}

// Schureman equation 224
// Can we be more precise than B "the solar coefficient" = 0.1681?
function _nup(N: number, i: number, omega: number): number {
    const I = d2r * _I(N, i, omega);
    const nu = d2r * _nu(N, i, omega);
    return r2d * Math.atan2(Math.sin(2*I)*Math.sin(nu), (Math.sin(2*I)*Math.cos(nu)+0.3347));
}

// Schureman equation 232
function _nupp(N: number, i: number, omega: number): number {
    const I = d2r * _I(N, i, omega);
    const nu = d2r * _nu(N, i, omega);
    const tan2nupp = (Math.sin(I)**2*Math.sin(2*nu))/(Math.sin(I)**2*Math.cos(2*nu)+0.0727);
    return r2d * 0.5 * Math.atan(tan2nupp);
}

interface AstroPolynomials {
    's': number[];
    'h': number[];
    'p': number[];
    'N': number[];
    'pp': number[];
    '90': number[];
}

interface OtherPolynomials {
    'omega': number[];
    'i': number[];
}

// We can use polynomial fits from Meeus to obtain good approximations to
// some astronomical values (and therefore speeds).
const polynomials: AstroPolynomials = {
    's': lunar_longitude_coefficients,
    'h': solar_longitude_coefficients,
    'p': lunar_perigee_coefficients,
    'N': lunar_node_coefficients,
    'pp': solar_perigee_coefficients,
    '90': [90.0],
};

const otherPolynomials: OtherPolynomials = {
    'omega': adjusted_terrestrial_obliquity_coefficients,
    'i': lunar_inclination_coefficients
};

export function astro(t: Date): Record<string, AstronomicalParameter> {
    const a: Record<string, AstronomicalParameter> = {};

    // Polynomials are in T, that is Julian Centuries; we want our speeds to be
    // in the more convenient unit of degrees per hour.
    const dT_dHour = 1 / (24 * 365.25 * 100);
    const computedT = T(t);
    
    for (const [name, coefficients] of Object.entries(polynomials)) {
        a[name] = {
            value: polynomial(coefficients, computedT) % 360.0,
            speed: d_polynomial(coefficients, computedT) * dT_dHour
        };
    }
    
    for (const [name, coefficients] of Object.entries(otherPolynomials)) {
        a[name] = {
            value: polynomial(coefficients, computedT) % 360.0,
            speed: d_polynomial(coefficients, computedT) * dT_dHour
        };
    }

    // Some other parameters defined by Schureman which are dependent on the
    // parameters N, i, omega for use in node factor calculations. We don't need
    // their speeds.
    const args = [a['N'].value, a['i'].value, a['omega'].value] as [number, number, number];
    const schuremanParams: Record<string, (N: number, i: number, omega: number) => number> = {
        'I': _I,
        'xi': _xi,
        'nu': _nu,
        'nup': _nup,
        'nupp': _nupp
    };
    
    for (const [name, func] of Object.entries(schuremanParams)) {
        a[name] = {
            value: func(...args) % 360.0,
            speed: null
        };
    }

    // We don't work directly with the T (hours) parameter, instead our spanning
    // set for equilibrium arguments is given by T+h-s, s, h, p, N, pp, 90.
    // This is in line with convention.
    const hour = {
        value: (JD(t) - Math.floor(JD(t))) * 360.0,
        speed: 15.0
    };
    
    a['T+h-s'] = {
        value: hour.value + a['h'].value - a['s'].value,
        speed: (hour.speed + (a['h'].speed ?? 0) - (a['s'].speed ?? 0))
    };
    
    // It is convenient to calculate Schureman's P here since several node
    // factors need it, although it could be argued that these
    // (along with I, xi, nu etc) belong somewhere else.
    a['P'] = {
        value: (a['p'].value - a['xi'].value) % 360.0,
        speed: null
    };
    
    return a;
}

// make an astro for the V function faster by preparing for it
export function simpleAstro(t: Date): Record<string, AstronomicalParameter> {
    // will only need to access the values of
    // [a['T+h-s'], a['s'], a['h'], a['p'], a['N'], a['pp'], a['90']]
    // do not include speeds or other dictionary entries
    const a: Record<string, AstronomicalParameter> = {};

    // Polynomials are in T, that is Julian Centuries
    const JDT = JD(t);
    const computedT = (JDT - 2451545.0)/36525;
    
    for (const [name, coefficients] of Object.entries(polynomials)) {
        a[name] = {
            value: polynomial(coefficients, computedT) % 360.0,
            speed: 0
        };
    }

    // We don't work directly with the T (hours) parameter, instead our spanning
    // set for equilibrium arguments is given by T+h-s, s, h, p, N, pp, 90.
    // This is in line with convention.
    const hour = (JDT - Math.floor(JDT)) * 360.0;
    a['T+h-s'] = {
        value: hour + a['h'].value - a['s'].value,
        speed: 0
    };
    
    return a;
}
