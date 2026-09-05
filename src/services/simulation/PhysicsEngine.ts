import * as math from 'mathjs';
import { SimulationSpecification, SimulationState } from '../../types/simulation';

export class PhysicsEngine {
  private spec: SimulationSpecification;
  private state: SimulationState;

  constructor(spec: SimulationSpecification) {
    this.spec = spec;
    this.state = this.getInitialState();
  }

  private getInitialState(): SimulationState {
    const parameters: Record<string, number> = {};
    for (const p of this.spec.parameters) {
      parameters[p.id] = p.default;
    }

    this.state = {
      status: 'READY',
      time: 0,
      parameters,
      measurements: [],
      errors: []
    };

    // Đảm bảo các đại lượng tính toán (formula.target) có giá trị đúng
    // ngay từ lần render đầu tiên, thay vì đợi người dùng chỉnh tham số.
    this.evaluateFormulas();
    this.validateConstraints();

    return this.state;
  }

  public getState(): SimulationState {
    return this.state;
  }

  public updateParameter(id: string, value: number): SimulationState {
    // Basic bounds checking
    const paramSpec = this.spec.parameters.find(p => p.id === id);
    if (paramSpec) {
      if (value < paramSpec.min) value = paramSpec.min;
      if (value > paramSpec.max) value = paramSpec.max;
    }

    this.state.parameters[id] = value;
    
    this.evaluateFormulas();
    this.validateConstraints();

    return { ...this.state }; // Return a copy to trigger re-renders
  }

  private evaluateFormulas() {
    // Basic implementation: iterate through formulas and evaluate them
    // In a more complex engine, we'd build a dependency graph and evaluate in topological order.
    // For Ohm's law and simple sims, linear evaluation is sufficient if ordered correctly.
    for (const formula of this.spec.formulas) {
      try {
        const result = math.evaluate(formula.expression, this.state.parameters);
        
        // Prevent NaN and Infinity
        if (isNaN(result) || !isFinite(result)) {
           this.state.errors.push(`Calculation error for ${formula.target}: Invalid numerical result.`);
        } else {
           this.state.parameters[formula.target] = result;
        }
      } catch (err: any) {
        this.state.errors.push(`Formula error (${formula.target}): ${err.message}`);
      }
    }
  }

  private validateConstraints() {
    this.state.errors = []; // Clear previous errors
    for (const constraint of this.spec.constraints) {
      try {
        const isValid = math.evaluate(constraint.expression, this.state.parameters);
        if (!isValid) {
          this.state.errors.push(constraint.errorMessage);
        }
      } catch (err: any) {
        this.state.errors.push(`Constraint error: ${err.message}`);
      }
    }
    
    if (this.state.errors.length > 0) {
      this.state.status = 'ERROR';
    } else if (this.state.status === 'ERROR') {
      this.state.status = 'READY'; // Or keep it running if it was running
    }
  }

  public takeMeasurement() {
    this.state.measurements.push({ ...this.state.parameters, time: this.state.time });
    return { ...this.state };
  }

  public reset() {
    this.state = this.getInitialState();
    this.evaluateFormulas(); // Initial eval
    this.validateConstraints();
    return { ...this.state };
  }
}
