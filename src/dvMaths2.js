// import { derivative, simplify } from 'mathjs';
// import { Equation, Expression, parse } from 'algebra.js';

// //const equation = new Equation('G-((P+S+T*F+F)/(P+S+T*F+F*L))*((P+T*F*L+F*L)/(P+T*F*L))', 0);
// const leftSide = parse('G-((P+S+T*F+F)/(P+S+T*F+F*L))*((P+T*F*L+F*L)/(P+T*F*L))') as Expression;
// const equation = new Equation(leftSide, 0);
// const solvedForF = equation.solveFor('F');

// const formula = '((P+S+T*F+F)/(P+S+T*F+F*L))*((P+T*F*L+F*L)/(P+T*F*L))-G';
// // const solvedForF = formula.solve, { F: 'F' });
// const derivativeWithRespectToL = derivative(solvedForF!.toString(), 'L');

// export function evaluateAspDer(values: { P: number, T: number, S: number, L: number, G: number }) {
//   return derivativeWithRespectToL.evaluate(values);
// }

import nerdamer from 'nerdamer';
require('nerdamer/Algebra'); 
require('nerdamer/Calculus'); 
require('nerdamer/Solve'); 
require('nerdamer/Extra');

const equation = 'G-((P+S+T*F+F)/(P+S+T*F+F*L))*((P+T*F*L+F*L)/(P+T*F*L)) = 0';
const solvedForF = nerdamer('simplify(' + nerdamer.solveEquations(equation, 'F')[2] + ')');
//console.log(solvedForF);
const derivativeWithRespectToL = nerdamer.diff(solvedForF.toString(), 'L');

export function evaluateAspDer(values) {
  return derivativeWithRespectToL.evaluate(values).text();
}

// Example usage:
// const result = evaluate({  P: 2.25, T: 0.125, S: 2.75, L: 0.5, G: 4.660833448431555 });
// console.log(result);

// P: 2.25, T: 0.125, S: 2.75, L: 0.5, G: 4.660833448431555