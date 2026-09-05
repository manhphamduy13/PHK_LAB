import React from 'react';
import { SimulationSpecification } from '../../types/simulation';
import { OhmsLawSimulation } from './OhmsLawSimulation';
import { DensitySimulation } from './DensitySimulation';
import { FluidPressureSimulation } from './FluidPressureSimulation';
import { ArchimedesSimulation } from './ArchimedesSimulation';

interface SimulationPlayerProps {
  spec: SimulationSpecification;
}

export function SimulationPlayer({ spec }: SimulationPlayerProps) {
  // Routing to specific simulation components based on type
  // This acts as the SimulationRegistry implementation on the frontend
  switch (spec.type) {
    case 'OhmsLawSimulation':
      return <OhmsLawSimulation spec={spec} />;
    case 'DensitySimulation':
      return <DensitySimulation spec={spec} />;
    case 'FluidPressureSimulation':
      return <FluidPressureSimulation spec={spec} />;
    case 'ArchimedesSimulation':
      return <ArchimedesSimulation spec={spec} />;
    // Add more simulation types here later
    default:
      return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
          <h3 className="font-bold text-lg">Simulation Type Not Supported</h3>
          <p>The simulation type "{spec.type}" is not registered in the player.</p>
        </div>
      );
  }
}
