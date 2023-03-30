import './App.css';
import './engineHelpers'
// import { engines } from './engines';
import engines from './data/engines.json';
import { planets } from './planets';
import React, { useState } from 'react';
import { getISP, getThrust } from './engineHelpers';

const GridPage = () => {
  // Define column values
  const [engineCount, setEngineCount] = useState([1,2,3,4,5,6,7,8]);

  // Define mode
  const [mode, setMode] = useState(0);

  // Define selected planet
  const [selectedPlanet, setSelectedPlanet] = useState(planets[2]);

  // Define target Delta-V
  const [targetDeltaV, setTargetDeltaV] = useState(3800);

  // Define Payload mass
  const [payloadMass, setPayloadMass] = useState(2);

  // Handle slider change
  const handleSliderChange = (event) => {
    const value = event.target.value;
    const newengineCount = [];
    for (let i = 1; i <= value; i++) {
      newengineCount.push(i);
    }
    setEngineCount(newengineCount);
  };

  const calculateFuelMass = (isp, mass, fuelRatio) => {
    return (mass * (Math.exp(targetDeltaV/(isp*selectedPlanet.gravity))-1))/(1 + fuelRatio-fuelRatio*Math.exp(targetDeltaV/(isp*selectedPlanet.gravity)));
  };

  const calculateDeltaV = (isp, massFull, massEmpty) => {
    return isp * selectedPlanet.gravity * Math.log((massFull) / massEmpty);
  };

  // Calculate Thrust-to-Weight ratio
  const calculateTWR = (thrust, totalmass) => {
    return thrust / ((totalmass) * selectedPlanet.gravity);
  };

  // Calculate the array of engine Data
  function calculateEngineData() {
    const newEngineData = [];
    for (const engine of engines) {
      if (engine.fuel_type == "RocketFuel") {
        engine.data = engineCount.map(numEngines => {
          const data = {};
          const mass = engine.mass * Number(numEngines) + payloadMass;
          data.mass = engine.mass * Number(numEngines) + payloadMass;
          data.numEngines = numEngines;
          data.enginemass = engine.mass * Number(numEngines);
          data.fuelmass = calculateFuelMass(getISP(engine, mode), mass, engine.fuelTankRatio);
          data.tankagemass = data.fuelmass*engine.fuelTankRatio;
          data.thrust = getThrust(engine, mode) * Number(numEngines);
          data.massFull = data.fuelmass*(1+ engine.fuelTankRatio) + mass;
          data.twr = calculateTWR(data.thrust, data.massFull);
          data.massEmpty = data.fuelmass*engine.fuelTankRatio + mass;
          return data;
        });
        newEngineData.push(engine);
      }
    }
    console.log(newEngineData);
    return newEngineData;
  }

  // Define engine data
  const [engineData, setEngineData] = useState(calculateEngineData());

  // setEngineData(calculateEngineData);

  // // Calculate min and max values
  // let minValue = Number.MAX_VALUE;
  // let maxValue = Number.MIN_VALUE;
  // engineData.forEach((row) => {
  //   engineCount.forEach((numEngines) => {
  //     const mass = row.mass * numEngines + payloadMass;
  //     const deltaV = calculateDeltaV(row.isp[mode], mass);
  //     minValue = Math.min(minValue, deltaV);
  //     maxValue = Math.max(maxValue, deltaV);
  //   });
  // });

  // Calculate cell color
  // const getCellColor = (value) => {
  //   const ratio = (value - minValue) / (maxValue - minValue);
  //   const red = Math.round(255 * (1 - ratio));
  //   const green = Math.round(255 * ratio);
  //   return `rgb(${red}, ${green}, 0)`;
  // };

  // Calculate Delta-V


  return (
    <div>
      <label htmlFor="mode-select">Mode:</label> 
      <select id="mode-select" value={mode} onChange={(event) => setMode(event.target.value)}>
        <option value="0">Vacuum</option>
        <option value="1">Atmosphere</option>
      </select>
      <br />
      <label htmlFor="planet-select">Planet:</label> 
      <select
        id="planet-select"
        value={selectedPlanet.name}
        onChange={(event) =>
          setSelectedPlanet(planets.find((planet) => planet.name === event.target.value))
        }
      >
        {planets.map((planet) => (
          <option key={planet.name} value={planet.name} >
            {planet.name}
          </option>
        ))}
      </select>
      <br />
      <label htmlFor="target-delta-v-input">Target Delta-V:</label> 
      <input
        id="target-delta-v-input"
        type="number"
        value={targetDeltaV}
        onChange={(event) => setTargetDeltaV(Number(event.target.value))}
      />
      <br />
      <label htmlFor="vehicle-mass-input">Vehicle Mass:</label> 
      <input
        id="vehicle-mass-input"
        type="number"
        value={payloadMass}
        onChange={(event) => setPayloadMass(Number(event.target.value))}
      />
      <br />
      <label htmlFor="column-slider">Number of Engines:</label> 
      <input
        id="column-slider"
        type="range"
        min="1"
        max="10"
        value={engineCount.length}
        onChange={handleSliderChange}
      />
      <table>
        <thead>
          <tr>
            <th></th>
            {engineCount.map((numEngines) => (
              <th key={numEngines}>{numEngines}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {engineData.map((engine) => (
            <tr key={engine.name}>
              <td>
                {engine.name}<br />
                Mass: {engine.mass}<br />
                ISP: {getISP(engine, mode).toFixed(2)}<br />
                Thrust: {getThrust(engine, mode).toFixed(2)}<br />
              </td>
              {engine.data.map((cell) => {
                return (
                <td key={cell.name + cell.numEngines}>
                  Fuel Mass: {cell.fuelmass.toFixed(2)}<br />
                  Total Vehicle Mass: {(cell.massFull).toFixed(2)}<br />
                  Empty Mass: {(cell.massEmpty).toFixed(2)}<br />
                  TWR: {cell.twr.toFixed(2)}
                </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GridPage;