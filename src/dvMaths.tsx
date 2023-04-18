//These functions are used to figure our the fuel required to reach a target dV with "asparagus staging"
// G = Math.exp(dV / (9.80665 * Isp))
// P = Payload Mass + Engines Mass
// S = Staging Mass + Engine Mass for Asparagus Staging
// L = Ratio of First Stage to Second Stage (Second stage Fuel = Fuel * L)
// T = Ratio of Fuel Tank Masss to Fuel Mass

export function evaluateFuel(G: number, P: number, S: number, L: number, T: number) {
    
    const F = -(P + P*T - Math.sqrt(G*G*L*L*P*P*T*T - 2*G*G*L*L*P*P*T + G*G*L*L*P*P + 2*G*G*L*L*P*S*T*T - 2*G*G*L*L*P*S*T + G*G*L*L*S*S*T*T - 2*G*G*L*P*P*T*T + 2*G*G*L*P*P*T - 2*G*G*L*P*S*T*T + G*G*P*P*T*T - 2*G*L*L*P*P*T*T - 2*G*L*L*P*P - 4*G*L*L*P*S*T*T - 2*G*L*L*P*S*T - 2*G*L*L*P*S - 2*G*L*L*S*S*T*T - 2*G*L*L*S*S*T + 4*G*L*P*P*T*T + 2*G*L*P*P*T + 2*G*L*P*P + 4*G*L*P*S*T*T + 4*G*L*P*S*T + 4*G*L*P*S - 2*G*P*P*T*T - 2*G*P*P*T + L*L*P*P*T*T + 2*L*L*P*P*T + L*L*P*P + 2*L*L*P*S*T*T + 4*L*L*P*S*T + 2*L*L*P*S + L*L*S*S*T*T + 2*L*L*S*S*T + L*L*S*S - 2*L*P*P*T*T - 4*L*P*P*T - 2*L*P*P - 2*L*P*S*T*T - 4*L*P*S*T - 2*L*P*S + P*P*T*T + 2*P*P*T + P*P) + L*P + L*S - G*L*P - G*P*T + L*P*T + L*S*T - G*L*P*T - G*L*S*T)/(2*L*(2*T - G*T*T + T*T - G*L*T + 1)); 
    return F;
}

export function testFunc(G: number, P: number, S: number, L: number, T: number) {
    return P+ L*G;
}

export function evaluateDerivative(G: number, P: number, S: number, L: number, T: number) {
    const D = (P + P*T - Math.sqrt(G*G*L*L*P*P*T*T - 2*G*G*L*L*P*P*T + G*G*L*L*P*P + 2*G*G*L*L*P*S*T*T - 2*G*G*L*L*P*S*T + G*G*L*L*S*S*T*T - 2*G*G*L*P*P*T*T + 2*G*G*L*P*P*T - 2*G*G*L*P*S*T*T + G*G*P*P*T*T - 2*G*L*L*P*P*T*T - 2*G*L*L*P*P - 4*G*L*L*P*S*T*T - 2*G*L*L*P*S*T - 2*G*L*L*P*S - 2*G*L*L*S*S*T*T - 2*G*L*L*S*S*T + 4*G*L*P*P*T*T + 2*G*L*P*P*T + 2*G*L*P*P + 4*G*L*P*S*T*T + 4*G*L*P*S*T + 4*G*L*P*S - 2*G*P*P*T*T - 2*G*P*P*T + L*L*P*P*T*T + 2*L*L*P*P*T + L*L*P*P + 2*L*L*P*S*T*T + 4*L*L*P*S*T + 2*L*L*P*S + L*L*S*S*T*T + 2*L*L*S*S*T + L*L*S*S - 2*L*P*P*T*T - 4*L*P*P*T - 2*L*P*P - 2*L*P*S*T*T - 4*L*P*S*T - 2*L*P*S + P*P*T*T + 2*P*P*T + P*P) + L*P + L*S - G*L*P - G*P*T + L*P*T + L*S*T - G*L*P*T - G*L*S*T)/(2*L*L*(2*T - G*T*T + T*T - G*L*T + 1)) - (P + S + P*T + S*T - (G*P*P - P*S + L*P*P + L*S*S - 2*P*P*T - P*P - P*P*T*T + G*G*L*P*P + 2*G*P*P*T*T + G*G*P*P*T + L*P*P*T*T + L*S*S*T*T + 2*G*P*S + 2*L*P*S - 2*P*S*T - G*G*P*P*T*T - 2*G*L*P*P + G*P*P*T + 2*L*P*P*T + 2*L*S*S*T - P*S*T*T + 2*L*P*S*T*T - 2*G*L*P*P*T*T - 2*G*G*L*P*P*T - 2*G*L*S*S*T*T - G*G*P*S*T*T - 2*G*L*P*S + 2*G*P*S*T + 4*L*P*S*T + G*G*L*P*P*T*T + G*G*L*S*S*T*T - 2*G*L*S*S*T + 2*G*P*S*T*T - 4*G*L*P*S*T*T - 2*G*G*L*P*S*T + 2*G*G*L*P*S*T*T - 2*G*L*P*S*T)/Math.sqrt(G*G*L*L*P*P*T*T - 2*G*G*L*L*P*P*T + G*G*L*L*P*P + 2*G*G*L*L*P*S*T*T - 2*G*G*L*L*P*S*T + G*G*L*L*S*S*T*T - 2*G*G*L*P*P*T*T + 2*G*G*L*P*P*T - 2*G*G*L*P*S*T*T + G*G*P*P*T*T - 2*G*L*L*P*P*T*T - 2*G*L*L*P*P - 4*G*L*L*P*S*T*T - 2*G*L*L*P*S*T - 2*G*L*L*P*S - 2*G*L*L*S*S*T*T - 2*G*L*L*S*S*T + 4*G*L*P*P*T*T + 2*G*L*P*P*T + 2*G*L*P*P + 4*G*L*P*S*T*T + 4*G*L*P*S*T + 4*G*L*P*S - 2*G*P*P*T*T - 2*G*P*P*T + L*L*P*P*T*T + 2*L*L*P*P*T + L*L*P*P + 2*L*L*P*S*T*T + 4*L*L*P*S*T + 2*L*L*P*S + L*L*S*S*T*T + 2*L*L*S*S*T + L*L*S*S - 2*L*P*P*T*T - 4*L*P*P*T - 2*L*P*P - 2*L*P*S*T*T - 4*L*P*S*T - 2*L*P*S + P*P*T*T + 2*P*P*T + P*P) - G*P - G*P*T - G*S*T)/(2*L*(2*T - G*T*T + T*T - G*L*T + 1)) - (G*T*(P + P*T - Math.sqrt(G*G*L*L*P*P*T*T - 2*G*G*L*L*P*P*T + G*G*L*L*P*P + 2*G*G*L*L*P*S*T*T - 2*G*G*L*L*P*S*T + G*G*L*L*S*S*T*T - 2*G*G*L*P*P*T*T + 2*G*G*L*P*P*T - 2*G*G*L*P*S*T*T + G*G*P*P*T*T - 2*G*L*L*P*P*T*T - 2*G*L*L*P*P - 4*G*L*L*P*S*T*T - 2*G*L*L*P*S*T - 2*G*L*L*P*S - 2*G*L*L*S*S*T*T - 2*G*L*L*S*S*T + 4*G*L*P*P*T*T + 2*G*L*P*P*T + 2*G*L*P*P + 4*G*L*P*S*T*T + 4*G*L*P*S*T + 4*G*L*P*S - 2*G*P*P*T*T - 2*G*P*P*T + L*L*P*P*T*T + 2*L*L*P*P*T + L*L*P*P + 2*L*L*P*S*T*T + 4*L*L*P*S*T + 2*L*L*P*S + L*L*S*S*T*T + 2*L*L*S*S*T + L*L*S*S - 2*L*P*P*T*T - 4*L*P*P*T - 2*L*P*P - 2*L*P*S*T*T - 4*L*P*S*T - 2*L*P*S + P*P*T*T + 2*P*P*T + P*P) + L*P + L*S - G*L*P - G*P*T + L*P*T + L*S*T - G*L*P*T - G*L*S*T))/(2*L*Math.pow(2*T - G*T*T + T*T - G*L*T + 1,2));
    return D;
}

// Define a function to find the value of L where the result is closest to 0 using the bisection method
export function findL(G: number, P: number, S: number, T: number){
  let a = 0;
  let b = 1;
  let c = G* P;
  let tolerance = 1e-10;
  let maxIterations = 100;
  let i = 0;

  while (i < maxIterations) {
    c = (a + b) / 2;
    const fc = evaluateDerivative(G, P, S, c, T);
    //console.log([G, P, S, c, T, fc]);
    if (Math.abs(fc) < tolerance) {
      break;
    } else if (fc < 0) {
      a = c;
    } else {
      b = c;
    }

    i++;
  }
  //console.log(i + " iterations to find L " + c);
  return c;
};
