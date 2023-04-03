import './App.css';
import './engineHelpers'
// import { engines } from './engines';
import engines from './data/engines.json';
import { planets } from './planets';
import React, { useState } from 'react';
import { getISP, getThrust } from './engineHelpers';

const highlightTop = 30;
const calc_gravity = 9.80665;

const GridPage = () => {
  // Define column values
  const [engineCount, setEngineCount] = useState([1,2,3,4,5,6,7,8]);

  // Define mode
  const [mode, setMode] = useState(0);

  // Define selected planet
  const [selectedPlanet, setSelectedPlanet] = useState(planets[4]);

  // Define target Delta-V
  const [targetDeltaV, setTargetDeltaV] = useState(3800);

  // Define Payload mass
  const [payloadMass, setPayloadMass] = useState(2);

  // Define minimum TWR
  const [minTWR, setMinTWR] = useState(0.5);

  //Used to check if the modal window is open and displaying details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // Handle cell click and open model window
  const handleCellClick = (cell) => {
    setIsModalOpen(true);
    setSelectedCell(cell);
  }

  const Modal = ({ isOpen, onRequestClose, selectedCell }) => {
    if (!isOpen) return null;
  
    return (
      <div>
        <button onClick={onRequestClose}>Close</button>
        <h2>{selectedCell.name}</h2>
        <p>Burn Time: {selectedCell.burnTime.toFixed(0)}</p>
        <p>Fuel Mass: {selectedCell.fuelmass.toFixed(2)}</p>
        <p>Total Vehicle Mass: {selectedCell.massFull.toFixed(2)}</p>
        <p>TWR: {selectedCell.twr.toFixed(2)}</p>
      </div>
    );
  }

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
    return (mass * (Math.exp(targetDeltaV/(isp*calc_gravity))-1))/(1 + fuelRatio-fuelRatio*Math.exp(targetDeltaV/(isp*calc_gravity)));
  };

  const calculateDeltaV = (isp, massFull, massEmpty) => {
    return isp * calc_gravity * Math.log((massFull) / massEmpty);
  };

  // Calculate Thrust-to-Weight ratio
  const calculateTWR = (thrust, totalmass) => {
    return thrust / ((totalmass) * selectedPlanet.gravity);
  };

  // Calculate the array of engine Data
  function calculateEngineData() {
    const newEngineData = [];
    for (const engine of engines) {
      if (engine.fuel_type === "RocketFuel") {
        engine.data = engineCount.map(numEngines => {
          const data = {};
          const mass = engine.mass * Number(numEngines) + payloadMass;
          data.mass = engine.mass * Number(numEngines) + payloadMass;
          data.numEngines = numEngines;
          data.enginemass = engine.mass * Number(numEngines);
          data.fuelmass = calculateFuelMass(getISP(engine, mode*selectedPlanet.atmosphere), mass, engine.fuelTankRatio);
          data.tankagemass = data.fuelmass*engine.fuelTankRatio;
          data.massFull = data.fuelmass*(1+ engine.fuelTankRatio) + mass;
          data.massEmpty = data.fuelmass*engine.fuelTankRatio + mass;
          data.thrust = getThrust(engine, mode*selectedPlanet.atmosphere) * Number(numEngines);
          data.twr = calculateTWR(data.thrust, data.massFull);
          data.burnTime = data.fuelmass / (data.thrust / (getISP(engine, mode*selectedPlanet.atmosphere)*calc_gravity));
          return data;
        });
        newEngineData.push(engine);
      }
    }
    // loop through engines and calculate the minimum and maximum massFull values, only if the twr is greater than the minimum twr
    let minMassFull = Number.MAX_VALUE;
    let maxMassFull = Number.MIN_VALUE;
    for (const engine of newEngineData) {
      for (const data of engine.data) {
        if (data.twr >= minTWR) {
          minMassFull = Math.min(minMassFull, data.massFull);
          maxMassFull = Math.max(maxMassFull, data.massFull);
        }
      }
    }
    
    // loop through engines and assign it a percentage of the massFull value based on the min and max massFull values with 100% being the min and 0% being the max
    for (const engine of newEngineData) {
      for (const data of engine.data) {
        if (data.twr < minTWR) {
          data.weighted = 0;
        } else {
          //assign a value from 0 to 1 based on the massFull value with 1 being the min and 0 being the max
          data.weighted = 1 - (data.massFull - minMassFull) / (maxMassFull - minMassFull);
        }
      }
    }

    // For all data in engines, rank each one based on the weight value. 1 is the best and 0 is the worst
    for (const engine of newEngineData) {
      for (const data of engine.data) {
        data.rank = 0;
        for (const engine2 of newEngineData) {
          for (const data2 of engine2.data) {
            if (data.weighted < data2.weighted) {
              data.rank += 1;
            }
          }
        }
      }
    }
    return newEngineData;
  }

  // Define engine data
  const [engineData, setEngineData] = useState(calculateEngineData());


  const getCellColor = (data) => {
    let red = 255;
    let green = 0;

    // assign a color from red to green based on the weighted value
    // use an exponential function to make the color gradient more pronounced
    if (data.rank <= highlightTop) {
      green = Math.round(255 * (1 - Math.pow(data.rank/highlightTop, 2)));
      red = Math.round(255 * Math.pow(data.rank/highlightTop, 2));
    } else if (data.weighted > 0) {
    }

    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <div>
      <h3>Payload and Mission information</h3>
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
      <label htmlFor="column-slider">Maximum Number of Engines:</label> 
      <input
        id="column-slider"
        type="range"
        min="1"
        max="24"
        value={engineCount.length}
        onChange={handleSliderChange}
      />
      <br />
      <h3>Filter Parameters</h3>
      <label htmlFor="minTWR-input">Minimum TWR:</label> 
      <input
        id="minTWR-input"
        step={0.1}
        type="number"
        value={minTWR}
        onChange={(event) => setMinTWR(Number(event.target.value))}
      />
      <br />
      <table>
        <thead>
          <tr>
            <th>Engine Count</th>
            {engineCount.map((numEngines) => (
              <th key={numEngines}>{numEngines}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {engineData.map((engine) => (
            <tr key={engine.name}>
              <td>
                {engine.name}
                {/* {engine.name}<br />
                isp: {getISP(engine, mode)}<br />
                thrust: {getThrust(engine, mode)}<br /> */}
              </td>
              {engine.data.map((cell) => {
                return (
                <td key={cell.name + cell.numEngines} style={{backgroundColor: getCellColor(cell)}} onClick={() => handleCellClick(cell)}>
                  {cell.rank}
                </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} selectedCell={selectedCell} />
    </div>
  );
};

export default GridPage;