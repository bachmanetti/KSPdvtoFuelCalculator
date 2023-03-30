//Define Engines
export const engines = [
    {
      name: 'Terrier',
      mass: 0.5,
      thrust: { vacuum: 60, atmosphere: 14.78 },
      isp: { vacuum: 345, atmosphere: 85 },
      fuelTankRatio: 1/8
    },
    {
      name: 'Reliant',
      mass: 1.25,
      thrust: { vacuum: 240, atmosphere: 205.16 },
      isp: { vacuum: 310, atmosphere: 265 },
      fuelTankRatio: 1/8
    },
    {
      name: 'Swivel',
      mass: 1.5,
      thrust: { vacuum: 215, atmosphere: 167.97 },
      isp: { vacuum: 320, atmosphere: 250 },
      fuelTankRatio: 1/8
    },
    {
      name: 'Poodle',
      mass: 1.75,
      thrust: { vacuum: 250, atmosphere: 64.29 },
     isp: { vacuum: 350, atmosphere: 90 },
     fuelTankRatio: 1/8
    },
    {
      name: 'Mainsail',
      mass: 6,
      thrust: { vacuum: 1500, atmosphere: 1379.03 },
      isp: { vacuum: 310, atmosphere: 285 },
      fuelTankRatio: 1/8
    }
  ];