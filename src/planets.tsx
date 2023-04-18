  // Create Typescript interface for planets
  export interface Planet {
    name: string;
    orbits: string;
    gravity: number;
    atmosphere: number;
  }

  // Define planets
  export const planets: Planet[] = [
    {
      "name": "Kerbol",
      "orbits": "—",
      "gravity": 17.131,
      "atmosphere": 0.157907727430507
    },
    {
      "name": "Moho",
      "orbits": "Kerbol",
      "gravity": 2.698,
      "atmosphere": 0
    },
    {
      "name": "Eve",
      "orbits": "Kerbol",
      "gravity": 16.677,
      "atmosphere": 5
    },
    {
      "name": "Gilly",
      "orbits": "Eve",
      "gravity": 0.049,
      "atmosphere": 0
    },
    {
      "name": "Kerbin",
      "orbits": "Kerbol",
      "gravity": 9.81,
      "atmosphere": 1
    },
    {
      "name": "Mun",
      "orbits": "Kerbin",
      "gravity": 1.628,
      "atmosphere": 0
    },
    {
      "name": "Minmus",
      "orbits": "Kerbin",
      "gravity": 0.491,
      "atmosphere": 0
    },
    {
      "name": "Duna",
      "orbits": "Kerbol",
      "gravity": 2.943,
      "atmosphere": 0.0666666686745674
    },
    {
      "name": "Ike",
      "orbits": "Duna",
      "gravity": 1.099,
      "atmosphere": 0
    },
    {
      "name": "Dres",
      "orbits": "Kerbol",
      "gravity": 1.128,
      "atmosphere": 0
    },
    {
      "name": "Jool",
      "orbits": "Kerbol",
      "gravity": 7.848,
      "atmosphere": 15.0000004517777
    },
    {
      "name": "Laythe",
      "orbits": "Jool",
      "gravity": 7.848,
      "atmosphere": 0.600000018071106
    },
    {
      "name": "Vall",
      "orbits": "Jool",
      "gravity": 2.305,
      "atmosphere": 0
    },
    {
      "name": "Tylo",
      "orbits": "Jool",
      "gravity": 7.848,
      "atmosphere": 0
    },
    {
      "name": "Bop",
      "orbits": "Jool",
      "gravity": 0.589,
      "atmosphere": 0
    },
    {
      "name": "Pol",
      "orbits": "Jool",
      "gravity": 0.373,
      "atmosphere": 0
    },
    {
      "name": "Eeloo",
      "orbits": "Kerbol",
      "gravity": 1.687,
      "atmosphere": 0
    }
   ];
