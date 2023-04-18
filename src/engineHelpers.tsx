interface ISP {
    [key: number]: number;
}

interface Engine {
    thrust: number;
    isp: ISP;
}

// use the hermite cubic spline interpolation to get the isp at a given atmosphere
export function getISP(engine: Engine, atmosphere: number): number {
    const isp = engine.isp;
    const keys = Object.keys(isp).map(Number);
    keys.sort((a, b) => a - b);
    if (atmosphere <= keys[0]) {
        return isp[keys[0]];
    }
    if (atmosphere >= keys[keys.length - 1]) {
        return isp[keys[keys.length - 1]];
    }
    let i = 0;
    while (keys[i + 1] < atmosphere) {
        i++;
    }
    const x1 = keys[i];
    const x2 = keys[i + 1];
    const y1 = isp[x1];
    const y2 = isp[x2];
    const t = (atmosphere - x1) / (x2 - x1);
    return (2 * t ** 3 - 3 * t ** 2 + 1) * y1 + (-2 * t ** 3 + 3 * t ** 2) * y2;
}

// get the thrust at a given atmosphere
export function getThrust(engine: Engine, atmosphere: number): number {
    const vacuumISP = getISP(engine, 0);
    const atmISP = getISP(engine, atmosphere);
    return engine.thrust * (atmISP / vacuumISP);
}