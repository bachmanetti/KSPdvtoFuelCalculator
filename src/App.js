import './App.css';
import { engines } from './engines';
import { planets } from './planets';
import React, { useState } from 'react';

const GridPage = () => {
  // Define row data
  const [rowData, setRowData] = useState(engines);

  // Define column values
  const [engineCount, setEngineCount] = useState([1,2,3,4,5,6,7,8]);

  // Define mode
  const [mode, setMode] = useState('vacuum');

  // Define selected planet
  const [selectedPlanet, setSelectedPlanet] = useState(planets[2]);

  // Define target Delta-V
  const [targetDeltaV, setTargetDeltaV] = useState(4000);

  // Define vehicle mass
  const [vehicleMass, setVehicleMass] = useState(5);

  // Define fuel mass
  const [fuelMass, setFuelMass] = useState(100);

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

  const calculateDeltaV = (isp, mass) => {
    return isp * selectedPlanet.gravity * Math.log((fuelMass + mass) / mass);
  };

  const calculateDeltaV2 = (isp, massFull, massEmpty) => {
    return isp * selectedPlanet.gravity * Math.log((massFull) / massEmpty);
  };

  // Calculate Thrust-to-Weight ratio
  const calculateTWR = (thrust, totalmass) => {
    return thrust / ((totalmass) * selectedPlanet.gravity);
  };

  // Calculate the array of engine Data
  function calculateEngineData() {
    const newEngineData = engines.map((engine, index) => {
      engine.data = engineCount.map(numEngines => {
        const data = {};
        const mass = engine.mass * Number(numEngines) + vehicleMass;
        data.numEngines = numEngines;
        data.enginemass = engine.mass * Number(numEngines);
        data.fuelmass = calculateFuelMass(engine.isp[mode], mass, engine.fuelTankRatio);
        data.tankagemass = data.fuelmass*engine.fuelTankRatio;
        data.thrust = engine.thrust[mode] * Number(numEngines);
        data.massFull = data.fuelmass*(1+ engine.fuelTankRatio) + mass;
        data.twr = calculateTWR(data.thrust, data.massFull);
        data.massEmpty = data.fuelmass*engine.fuelTankRatio + mass;
        return data;
      });
      return engine;
    });
    console.log(newEngineData);
  }

  calculateEngineData();

  // Calculate min and max values
  let minValue = Number.MAX_VALUE;
  let maxValue = Number.MIN_VALUE;
  rowData.forEach((row) => {
    engineCount.forEach((numEngines) => {
      const mass = row.mass * numEngines + vehicleMass;
      const deltaV = calculateDeltaV(row.isp[mode], mass);
      minValue = Math.min(minValue, deltaV);
      maxValue = Math.max(maxValue, deltaV);
    });
  });

  // Calculate cell color
  const getCellColor = (value) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    const red = Math.round(255 * (1 - ratio));
    const green = Math.round(255 * ratio);
    return `rgb(${red}, ${green}, 0)`;
  };

  // Calculate Delta-V


  return (
    <div>
      <label htmlFor="mode-select">Mode:</label> 
      <select id="mode-select" value={mode} onChange={(event) => setMode(event.target.value)}>
        <option value="vacuum">Vacuum</option>
        <option value="atmosphere">Atmosphere</option>
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
        value={vehicleMass}
        onChange={(event) => setVehicleMass(Number(event.target.value))}
      />
      <br />
      <label htmlFor="fuel-mass-input">Fuel Mass:</label> 
      <input
        id="fuel-mass-input"
        type="number"
        value={fuelMass}
        onChange={(event) => setFuelMass(Number(event.target.value))}
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
          {rowData.map((row) => (
            <tr key={row.name}>
              <td>
                {row.name}<br />
                Mass: {row.mass}<br />
                ISP: {row.isp[mode]}<br />
                Thrust: {row.thrust[mode]}<br />
              </td>
              {engineCount.map((numEngines) => {
                const mass = row.mass * Number(numEngines) + vehicleMass;
                const fuelmass = calculateFuelMass(row.isp[mode], mass, row.fuelTankRatio);
                const deltaV = calculateDeltaV2(row.isp[mode], fuelmass*(1+ row.fuelTankRatio) + mass ,fuelmass*row.fuelTankRatio + mass);
                const thrust = row.thrust[mode] * Number(numEngines);
                const twr = calculateTWR(thrust, fuelmass*(1+ row.fuelTankRatio) + mass);
                return (
                  <td key={numEngines} style={{ backgroundColor: getCellColor(deltaV) }}>
                    Fuel Mass: {fuelmass.toFixed(2)}<br />
                    Total Vehicle Mass: {(fuelmass*(1+ row.fuelTankRatio) + mass).toFixed(2)}<br />
                    Empty Mass: {(fuelmass*row.fuelTankRatio + mass).toFixed(2)}<br />
                    isp: {row.isp[mode].toFixed(2)}<br />
                    Delta-V: {deltaV.toFixed(2)}<br />
                    TWR: {twr.toFixed(2)}
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