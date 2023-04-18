import React, { useState, useEffect } from 'react';
import { evaluateDerivative, evaluateFuel, findL, testFunc } from './dvMaths'; 
import functionPlot from "function-plot";

const TestMaths = () => {
    // Define the range of values for P and G
    const pValues = Array.from({ length: 3 }, (_, i) => i * 0.25 + 2.0);
    const iValues = Array.from({ length: 3 }, (_, i) => i * 15 + 250);

    // Define a fixed value for S
    const sValue = 2.75;
    const tValue = 0.125;

    let data: any = [];

    // Calculate the L values for each combination of P and G
    const lValues = iValues.map(i => pValues.map(p => {
        const G = Math.exp(4000 / (9.80665 * i));
        console.log(G);
        data = [
            ...data,
            {
                fn: (scope: any) => evaluateDerivative(G, p, sValue, scope.x, tValue),
                sampler: 'builtIn',
                graphType: 'polyline'
            },
            {
                fn: (scope: any) => evaluateFuel(G, p, sValue, scope.x, tValue),
                sampler: 'builtIn',
                graphType: 'polyline'
            },
        ];
        return findL(G, p, sValue, tValue);
    }));

    React.useEffect(() => {
        functionPlot({
            target: '#plot',
            width: 800,
            height: 600,
            yAxis: { label: 'y axis', domain: [-5, 30] },
            xAxis: { label: 'x axis', domain: [0, 1] },
            data: data,
            disableZoom: true,
            grid: true,
        });
    });

    return (
        <div>
            <div>
                Test
            </div>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {pValues.map(p => (
                            <th key={p}>{p}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {lValues.map((row, i) => (
                        <tr key={i}>
                            <th>{iValues[i]}</th>
                            {row.map((cell, j) => (
                                <td key={j}>{cell!.toFixed(4)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div id="plot"></div>;
        </div>
    );
};

export default TestMaths;