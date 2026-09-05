import { SimulationSpecification } from '../../types/simulation';
import { densitySimulation } from './density';
import { fluidPressureSimulation } from './fluidPressure';
import { archimedesSimulation } from './archimedes';

export interface LabMeta {
  spec: SimulationSpecification;
  /** Ảnh minh hoạ / icon key hiển thị ở trang danh sách */
  topic: string;
  /** Thời lượng ước tính để hoàn thành, phục vụ hiển thị UI */
  estMinutes: number;
}

export const VIRTUAL_LABS: LabMeta[] = [
  { spec: densitySimulation, topic: 'Khối lượng riêng', estMinutes: 15 },
  { spec: fluidPressureSimulation, topic: 'Áp suất chất lỏng', estMinutes: 15 },
  { spec: archimedesSimulation, topic: 'Lực đẩy Archimedes', estMinutes: 20 },
];

export function getLabById(id: string): LabMeta | undefined {
  return VIRTUAL_LABS.find((l) => l.spec.id === id);
}

export {
  densitySimulation,
  fluidPressureSimulation,
  archimedesSimulation,
};
