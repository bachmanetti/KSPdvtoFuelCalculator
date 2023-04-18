import './App.css';
import './engineHelpers'

//Import the engine data and typescript definitions
import engine_data from './data/engines.json';
import { Engine, EngineData } from './data/engines';

//Import the fuel data and typescript definitions
import fuel_data from './data/fuelvalues.json';
import { FuelValue } from './data/fuelvalues';

//Import the planet data and typescript definitions
import { planets, Planet } from './planets';
import React, { useState } from 'react';
import { getISP, getThrust } from './engineHelpers';

// Halfmoon information
// import 'halfmoon/css/halfmoon-variables.min.css';
// import halfmoon from 'halfmoon';
// halfmoon.onDOMContentLoaded();


// Define engines and fuel values and default values
const engines: Engine[] = engine_data as Engine[];
const fuelvalues: FuelValue[] = fuel_data as FuelValue[];
const highlightTop = 30;
const calc_gravity = 9.80665;

// Define the grid page
const GridPage = () => {
  // Define column values
  const [engineCount, setEngineCount] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // Define the boolean to use to show detailed values in cells
  const [showDetailed, setShowDetailed] = useState(false);

  // Define the boolean to show invalid engines
  const [showInvalid, setShowInvalid] = useState(false);

  //Define boolean to show instructions
  const [showInstructions, setShowInstructions] = useState(false);

  // Define mode
  const [mode, setMode] = useState(0);

  // Define selected planet
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(planets[4]);

  // Define target Delta-V
  const [targetDeltaV, setTargetDeltaV] = useState(3800);

  // Define Payload mass
  const [payloadMass, setPayloadMass] = useState(2);

  // Define minimum TWR
  const [stageMinTWR, setStageMinTWR] = useState(1.1);

  // Define slider values each for "Mass", "Cost", and "Thrust"
  const [rankingValues, setRankingValues] = useState({
    cellRanking: "Combo",
    mass: 50,
    cost: 50,
    thrust: 50,
    targetTWR: 1.2,
  });


  //Used to check if the modal window is open and displaying details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<EngineData | null>(null);

  // Handle cell click and open model window
  const handleCellClick = (cell: EngineData) => {
    setIsModalOpen(true);
    setSelectedCell(cell);
  }


  const Modal = ({ isOpen, onRequestClose, selectedCell }: { isOpen: boolean, onRequestClose: () => void, selectedCell: EngineData | null }) => {
    if (!isOpen) return null;

    return (
      <div>
        <button onClick={onRequestClose}>Close</button>
        <h2>{selectedCell!.name}</h2>
        <p>Cost: {selectedCell!.totalCost.toFixed(0)}</p>
        <p>Burn Time: {selectedCell!.burnTime.toFixed(0)}</p>
        <p>Fuel Mass: {selectedCell!.fuelmass.toFixed(2)}</p>
        <p>Tankage: {selectedCell!.tankagemass.toFixed(2)}</p>
        <p>Total Vehicle Mass: {selectedCell!.massFull.toFixed(2)}</p>
        <p>Empty Mass: {selectedCell!.massEmpty.toFixed(2)}</p>
        <p>Engine Mass: {selectedCell!.enginemass.toFixed(2)}</p>
        <p>TWR: {selectedCell!.twr.toFixed(2)}</p>
        <p>Delta-V: {selectedCell!.deltaV.toFixed(2)}</p>
      </div>
    );
  }

  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    const newengineCount = [];
    for (let i = 1; i <= value; i++) {
      newengineCount.push(i);
    }
    setEngineCount(newengineCount);
  };

  // Calculate the fuel mass for a given engine and payload mass and target delta-v
  const calculateFuelMass = (isp: number, mass: number, fuelRatio: number, basefuel: number = 0) => {
    return (mass * (Math.exp(targetDeltaV / (isp * calc_gravity)) - 1) - basefuel) / (1 + fuelRatio - fuelRatio * Math.exp(targetDeltaV / (isp * calc_gravity)));
  };

  // Calculate the delta-v
  const calculateDeltaV = (isp: number, massFull: number, massEmpty: number) => {
    return isp * calc_gravity * Math.log((massFull) / massEmpty);
  };

  // Calculate Thrust-to-Weight ratio
  const calculateTWR = (thrust: number, totalmass: number) => {
    return thrust / ((totalmass) * selectedPlanet.gravity);
  };

  // Calculate the array of engine Data
  function calculateEngineData() {
    const newEngineData: Engine[] = [];
    for (const engine of engines) {
      if (engine.fuel_type === "RocketFuel" || engine.fuel_type === "LiquidFuel" || engine.fuel_type === "XenonGas" || engine.fuel_type === "SolidFuel") {
        engine.invalid = true;
        engine.data = engineCount.map(numEngines => {
          let mass = engine.mass * Number(numEngines) + payloadMass;
          if (engine.supplemental_mass) {
            mass += engine.supplemental_mass * Number(numEngines);
          }
          let fuelcost = 0;
          let fuelmass = 0;
          let tankagemass = 0;
          // Lookup fuel tank ratio from fuelvalues array
          const fuel_tank_ratio = 1 / fuelvalues.find(fuelvalue => fuelvalue.fuel_type === engine.fuel_type)!.fuelTankRatio;
          // Check if the engine has onboard_fuel value set, if it does then use that value, otherwise calculate the fuel mass
          if (engine.onboard_fuel) {
            fuelmass = calculateFuelMass(getISP(engine, mode * selectedPlanet.atmosphere), mass, 0);
            fuelcost = fuelvalues.find(fuelvalue => fuelvalue.fuel_type === engine.fuel_type)!.fuel_cost * fuelmass;
            if (fuelmass >= engine.onboard_fuel * numEngines && engine.fuel_type === "SolidFuel") {
              // If the fuel mass is greater than the onboard fuel and the engine is solid fuel, then set the fuel mass to the onboard fuel
              fuelmass = engine.onboard_fuel * numEngines;
              // Calculate the fuel cost using values from the fuelvalues array
              fuelcost = fuelvalues.find(fuelvalue => fuelvalue.fuel_type === engine.fuel_type)!.fuel_cost * fuelmass;
            } else if (fuelmass >= engine.onboard_fuel * numEngines) {
              // If the fuel mass is greater than the onboard fuel and the engine is liquid or gas fuel, then calculate the extra fuel mass and add it to the fuel mass
              let extra_fuel = calculateFuelMass(getISP(engine, mode * selectedPlanet.atmosphere), mass, fuel_tank_ratio, engine.onboard_fuel * numEngines);
              fuelcost = fuelvalues.find(fuelvalue => fuelvalue.fuel_type === engine.fuel_type)!.fuel_cost * engine.onboard_fuel
                + fuelvalues.find(fuelvalue => fuelvalue.fuel_type === engine.fuel_type)!.adjusted_fuel_cost * extra_fuel;
              tankagemass = extra_fuel * fuel_tank_ratio;
              fuelmass = engine.onboard_fuel * numEngines + extra_fuel;
            }
          } else {
            fuelmass = calculateFuelMass(getISP(engine, mode * selectedPlanet.atmosphere), mass, fuel_tank_ratio);
            tankagemass = fuelmass * fuel_tank_ratio;
            fuelcost = fuelvalues.find(fuelvalue => fuelvalue.fuel_type === engine.fuel_type)!.adjusted_fuel_cost * fuelmass;
          }
          const massEmpty = tankagemass + mass;
          const massFull = fuelmass + massEmpty;
          let deltaV = targetDeltaV;
          // If the engine is solid fuel and has onboard fuel, then calculate the delta-v
          if (engine.fuel_type === "SolidFuel" && engine.onboard_fuel) {
            if (fuelmass === engine.onboard_fuel * numEngines) {
              deltaV = calculateDeltaV(getISP(engine, mode * selectedPlanet.atmosphere), massFull, massEmpty);
            }
          }
          const thrust = getThrust(engine, mode * selectedPlanet.atmosphere) * Number(numEngines);;
          // Create the engine data object
          const data: EngineData = {
            name: engine.short_name,
            mass: mass,
            numEngines: numEngines,
            fuel_type: engine.fuel_type,
            fuel_tank_ratio: fuel_tank_ratio,
            isp: getISP(engine, mode * selectedPlanet.atmosphere),
            deltaV: deltaV,
            enginemass: mass - payloadMass,
            fuelmass: fuelmass,
            tankagemass: tankagemass,
            massFull: massFull,
            massEmpty: massEmpty,
            thrust: thrust,
            twr: calculateTWR(thrust, massFull),
            burnTime: fuelmass / (thrust / (getISP(engine, mode * selectedPlanet.atmosphere) * calc_gravity)),
            weighted: 0,
            rank: 0,
            totalCost: engine.cost * Number(numEngines) + fuelcost + (engine.supplemental_cost ? engine.supplemental_cost * Number(numEngines) : 0)
          };
          // if the fuelmass is greater than 0 for any combination, then set engine invalid to false
          if (fuelmass > 0) {
            engine.invalid = false;
          } else {
            data.invalid = true;
          }
          return data;
        });
        // If the engine is not invalid, then push it to the newEngineData array
        if (!engine.invalid) {
          newEngineData.push(engine);
        }
      }
    }
    // loop through engines and calculate the minimum and maximum massFull values, only if the twr is greater than the minimum twr
    let minMassFull = Number.MAX_VALUE;
    let maxMassFull = Number.MIN_VALUE;
    // Also find min and max cost values
    let minCost = Number.MAX_VALUE;
    let maxCost = Number.MIN_VALUE;
    // Min and max TWR values with the min being 0
    let minTWR = 0;
    let maxTWR = Number.MIN_VALUE;
    for (const engine of newEngineData) {
      for (const data of engine.data) {
        //if massfull <= 0, then set invalid to true
        if (data.massFull <= 0) {
          data.invalid = true;
        } else if (data.twr >= stageMinTWR && data.deltaV >= targetDeltaV) {
          maxTWR = Math.max(maxTWR, data.twr);
          minCost = Math.min(minCost, data.totalCost);
          maxCost = Math.max(maxCost, data.totalCost);
          minMassFull = Math.min(minMassFull, data.massFull);
          maxMassFull = Math.max(maxMassFull, data.massFull);
        }
      }
    }

    // loop through engines and assign it a percentage of the massFull value based on the min and max massFull values with 100% being the min and 0% being the max
    for (const engine of newEngineData) {
      for (const data of engine.data) {
        if (data.twr < stageMinTWR || data.deltaV < targetDeltaV || data.invalid) {
          data.weighted = 0;
        } else {
          // If rankingValues.cellRanking is set to cost, then use the cost values instead of the massFull values
          // If the rankingValues.cellRanking is set to mass, then use the massFull values
          // If the rankingValues.cellRanking is set to combo, then use a combination of the massFull and cost values
          // All of these values should be normalized between 0 and 1, with 1 being the lowest cost or weight and 0 being the highest cost or weight
          if (rankingValues.cellRanking === "Cost") {
            data.weighted = 1 - (data.totalCost - minCost) / (maxCost - minCost);
          } else if (rankingValues.cellRanking === "Mass") {
            data.weighted = 1 - (data.massFull - minMassFull) / (maxMassFull - minMassFull);
          } else if (rankingValues.cellRanking === "Combo") {
            // use the slider values to determine how much weight to give to the cost and massFull, and TWR values
            const weightMass = rankingValues.mass / (rankingValues.mass + rankingValues.cost + rankingValues.thrust);
            const weightCost = rankingValues.cost / (rankingValues.mass + rankingValues.cost + rankingValues.thrust);
            const weightThrust = rankingValues.thrust / (rankingValues.mass + rankingValues.cost + rankingValues.thrust);
            // Calculate the weighted TWR value based on its distance from the target TWR to the min or max TWR
            const weightedTWR = data.twr < rankingValues.targetTWR ? (data.twr - minTWR) / (rankingValues.targetTWR - minTWR) : (maxTWR - data.twr) / (maxTWR - rankingValues.targetTWR);
            data.weighted = 1 - (data.totalCost - minCost) / (maxCost - minCost) * weightCost - (data.massFull - minMassFull) / (maxMassFull - minMassFull) * weightMass + weightedTWR * weightThrust;
          }
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


  const getCellColor = (data: EngineData) => {
    let red = 255;
    let green = 0;
    if (data.weighted === 0) {
      return `rgb(100, 100, 120)`;
    }
    // assign a color from red to green based on the weighted value
    // use an exponential function to make the color gradient more pronounced
    if (data.rank <= highlightTop) {
      green = Math.round(255 * (1 - Math.pow(data.rank / highlightTop, 2)));
      red = Math.round(255 * Math.pow(data.rank / highlightTop, 2));
    } else if (data.weighted > 0) {
    }
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <div>
      <div className="ControlsSection">
        <div>
          <h3>Payload and Mission information</h3>
          <label htmlFor="mode-select">Mode:</label>
          <select id="mode-select" value={mode} onChange={(event) => setMode(Number(event.target.value))}>
            <option value="0">Vacuum</option>
            <option value="1">Atmosphere</option>
          </select>
          <br />
          <label htmlFor="planet-select">Planet:</label>
          <select
            id="planet-select"
            value={selectedPlanet.name}
            onChange={(event) =>
              setSelectedPlanet(planets.find((planet) => planet.name === event.target.value)!)
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
            min={0}
            type="number"
            value={targetDeltaV}
            onChange={(event) => setTargetDeltaV(Number(event.target.value))}
          />
          <br />
          <label htmlFor="vehicle-mass-input">Vehicle Mass:</label>
          <input
            id="vehicle-mass-input"
            min={0}
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
        </div>
        <div>
          <h3>Filter Parameters</h3>
          <label htmlFor="minTWR-input">Minimum TWR:</label>
          <input
            id="minTWR-input"
            min={0}
            step={0.05}
            type="number"
            value={stageMinTWR}
            onChange={(event) => setStageMinTWR(Number(event.target.value))}
          />
          <br />
          {/* Control for choosing preference Cell ranking */}
          <label htmlFor="cell-ranking">Ranking:</label>
          <select
            id="cell-ranking"
            value={rankingValues.cellRanking}
            onChange={(event) => setRankingValues({ ...rankingValues, cellRanking: event.target.value })}
          >
            <option value="Mass">Mass</option>
            <option value="Cost">Cost</option>
            <option value="Combo">Combo</option>
          </select>
          <br />
          {/* Sliders for controlling the ratio of Mass, Cost, and Thrust */}
          {/* Disable sliders for any cellRanking except Combo */}
          <label htmlFor="mass-slider">Mass:</label>
          <input
            id="mass-slider"
            type="range"
            min="0"
            max="100"
            value={rankingValues.mass}
            onChange={(event) => setRankingValues({ ...rankingValues, mass: Number(event.target.value) })}
            disabled={rankingValues.cellRanking !== 'Combo'}
          />
          <br />
          <label htmlFor="cost-slider">Cost:</label>
          <input
            id="cost-slider"
            type="range"
            min="0"
            max="100"
            value={rankingValues.cost}
            onChange={(event) => setRankingValues({ ...rankingValues, cost: Number(event.target.value) })}
            disabled={rankingValues.cellRanking !== 'Combo'}
          />
          <br />
          <label htmlFor="thrust-slider">Thrust:</label>
          <input
            id="thrust-slider"
            type="range"
            min="0"
            max="100"
            value={rankingValues.thrust}
            onChange={(event) => setRankingValues({ ...rankingValues, thrust: Number(event.target.value) })}
            disabled={rankingValues.cellRanking !== 'Combo'}
          />
          <br />
          {/* Control for Target TWR */}
          <label htmlFor="targetTWR-input">Target TWR:</label>
          <input
            id="targetTWR-input"
            min={0}
            step={0.05}
            type="number"
            value={rankingValues.targetTWR}
            onChange={(event) => setRankingValues({ ...rankingValues, targetTWR: Number(event.target.value) })}
            disabled={rankingValues.cellRanking !== 'Combo'}
          />

        </div>
        <div>
          <h3>Detailed Information</h3>
          {/* Show control for toggling Detailed Information */}
          <label htmlFor="show-detailed-info">Show Detailed Information:</label>
          <input
            id="show-detailed-info"
            type="checkbox"
            checked={showDetailed}
            onChange={() => setShowDetailed(!showDetailed)}
          />
          <br />
          {/* Show control for toggling Invalid Engines */}
          <label htmlFor="show-invalid-engines">Show Invalid Engines:</label>
          <input
            id="show-invalid-engines"
            type="checkbox"
            checked={showInvalid}
            onChange={() => setShowInvalid(!showInvalid)}
          />
        </div>
        {/* Show information on how to use this tool and provide warning that it is still under construction */}
        <div>
          <h3>How to Use</h3>
          <p>
            This tool is still under construction. It is not yet complete and may not be accurate. Please use at your own
            risk.
          </p>
          {/* show toggle for more instructions */}
          <label htmlFor="show-instructions">Show Instructions:</label>
          <input

            id="show-instructions"
            type="checkbox"
            checked={showInstructions}
            onChange={() => setShowInstructions(!showInstructions)}
          />
          <br />
          {showInstructions && (
            <div>
              <p>
                This tool is designed to help you find the best engine for your rocket. You can choose the planet you are
                launching from, the target delta-v, and the maximum number of engines you want to use. You can also choose the
                ranking you want to use to determine the best engine. The ranking can be based on mass, cost, or a combination
                of the two adn thrust. You can also choose the target TWR you want to achieve.
              </p>
              <p>
                The table will show you the best engine for each number of engines. The best engine is determined by the
                ranking you chose. The table will also show you the TWR, ISP, and thrust of the engine. If you want to see
                more detailed information, you can click on the engine name. This will show you the ISP, thrust, and mass of
                the engine. It will also show you the mass of the engine, the mass of the fuel, and the mass of the oxidizer.
                It will also show you the cost of the engine, the cost of the fuel, and the cost of the oxidizer.
              </p>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className='tableSection'>
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
                //if engine is invalid, then don't show it
                (!engine.invalid || showInvalid) && (
                  <tr key={engine.name}>
                    <td>
                      {engine.short_name}
                      {/* If detailedinfo is true, then show some of the engine details, else just show the short_name */}
                      {showDetailed && (
                        <div>
                          {/* Just show isp to 2 decimal places */}
                          <div>isp: {getISP(engine, mode).toFixed(2)}</div>
                          <div>thrust: {getThrust(engine, mode).toFixed(2)}</div>
                        </div>
                      )}
                    </td>
                    {engine.data.map((cell) => {
                      return (
                        <td key={cell.name + cell.numEngines} style={{ backgroundColor: getCellColor(cell) }} onClick={() => handleCellClick(cell)}>
                          {/* If the cell.invalid then just show an "X", otherwise show the details */}
                          {cell.invalid ? (
                            // center X in the cell
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>X</div>
                          ) : (
                            <div className='engineCell'>
                              {/* If showDetailed is false, then just show the cell rank. Else show the cell rank, Massfull, and TWR each on their own line with a label */}
                              {showDetailed ? (
                                <div>
                                  <div>Rank: {cell.rank + 1}</div>
                                  <div>Mass: {cell.massFull.toFixed(2)}</div>
                                  <div>Cost: {cell.totalCost.toFixed(0)}</div>
                                  <div>TWR: {cell.twr.toFixed(2)}</div>
                                </div>
                              ) : (
                                cell.rank + 1
                              )}
                            </div>
                          )}

                          {/* {cell.rank} */}
                        </td>
                      );
                    })}
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        <div className='modalSection'>
          <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} selectedCell={selectedCell} />
        </div>
      </div>
    </div>
  );
};

export default GridPage;