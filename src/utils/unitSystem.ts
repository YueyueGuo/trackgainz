import { UnitSystem } from '../types/workout';

export const getWeightLabel = (unitSystem: UnitSystem): string => {
  return unitSystem === 'metric' ? 'WEIGHT (KG)' : 'WEIGHT (LBS)';
};

export const getWeightUnit = (unitSystem: UnitSystem): string => {
  return unitSystem === 'metric' ? 'kg' : 'lbs';
};

export const getHeightLabel = (unitSystem: UnitSystem): string => {
  return unitSystem === 'metric' ? 'HEIGHT (CM)' : 'HEIGHT (INCHES)';
};

export const getHeightUnit = (unitSystem: UnitSystem): string => {
  return unitSystem === 'metric' ? 'cm' : 'inches';
};

export const convertWeight = (weight: number, fromUnit: UnitSystem, toUnit: UnitSystem): number => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    // Convert lbs to kg
    return weight * 0.453592;
  } else if (fromUnit === 'metric' && toUnit === 'imperial') {
    // Convert kg to lbs
    return weight * 2.20462;
  }
  
  return weight;
};

export const convertHeight = (height: number, fromUnit: UnitSystem, toUnit: UnitSystem): number => {
  if (fromUnit === toUnit) return height;
  
  if (fromUnit === 'imperial' && toUnit === 'metric') {
    // Convert inches to cm
    return height * 2.54;
  } else if (fromUnit === 'metric' && toUnit === 'imperial') {
    // Convert cm to inches
    return height * 0.393701;
  }
  
  return height;
}; 