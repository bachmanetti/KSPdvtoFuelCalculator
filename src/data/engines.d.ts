//define the interface for the propellant data
interface Propellant {
    name: string;
    ratio?: number;
    rate?: number;
    amount?: number;
    max_amount?: number;
}

//define the interface for the isp data
interface ISP {
    [elemName: string]: number;
}

// Define Engine Data interface
export interface EngineData {
    mass: number;
    massEmpty: number;
    numEngines: number;
    enginemass: number;
    fuelmass: number;
    tankagemass: number;
    massFull: number;
    twr: number;
    burnTime: number;
    deltaV: number;
    name: string;
    thrust: number;
    isp: number;
    fuel_type: string;
    fuel_tank_ratio: number;
    weighted: number;
    rank: number;
    totalCost: number;
    invalid?: boolean;
}

//define the interface for the engine data
export interface Engine {
    tech_required: string;
    cost: number;
    category: string;
    name: string;
    short_name: string;
    mass: number;
    thrust: number;
    propellant: Propellant[];
    isp: any;
    supplemental_mass?: number;
    supplemental_cost?: number;
    fuel_tank_ratio: number;
    fuel_type: string;
    thrust_atm: number;
    total_mass?: number;
    tank_ratio?: number;
    alternator?: number;
    fuel_mass?: number;
    onboard_fuel?: number;
    resource: Propellant[];
    cost_ratio?: number;
    fuel_mass_max?: number;
    max_fuel?: number;
    gimbal_range?: number;
    fuel_cost?: number;
    base_cost?: number;
    resource_type?: string;
    data: EngineData[];
    invalid?: boolean;
}