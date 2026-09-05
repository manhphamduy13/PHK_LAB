import { SimulationSpecification } from '../../types/simulation';

export const fluidPressureSimulation: SimulationSpecification = {
  id: 'fluid-pressure-01',
  type: 'FluidPressureSimulation',
  version: '1.0',
  title: 'Khảo sát áp suất chất lỏng',
  description:
    'Học sinh thay đổi độ sâu và loại chất lỏng (khối lượng riêng) để khảo sát áp suất tại một điểm trong lòng chất lỏng.',
  subject: 'Vật lí',
  grade: 8,

  parameters: [
    {
      id: 'h',
      label: 'Độ sâu',
      symbol: 'h',
      unit: 'cm',
      type: 'number',
      min: 0,
      max: 60,
      default: 10,
      step: 1,
      description: 'Khoảng cách từ mặt thoáng chất lỏng đến điểm đo áp suất.',
    },
    {
      id: 'rho',
      label: 'Khối lượng riêng chất lỏng',
      symbol: 'ρ',
      unit: 'kg/m³',
      type: 'number',
      min: 800,
      max: 1300,
      default: 1000,
      step: 10,
      description:
        'Nước tinh khiết ≈ 1000 kg/m³, dầu ăn ≈ 800-920 kg/m³, nước muối ≈ 1030-1100 kg/m³.',
    },
    {
      id: 'p',
      label: 'Áp suất',
      symbol: 'p',
      unit: 'Pa',
      type: 'number',
      min: 0,
      max: 8000,
      default: 0,
      step: 1,
      description: 'Được tính tự động: p = ρ.g.h (g = 9.8 m/s²).',
    },
  ],
  objects: [
    { id: 'tank', type: 'fluid_tank' },
    { id: 'sensor', type: 'pressure_sensor' },
  ],
  formulas: [
    {
      id: 'f1',
      target: 'p',
      expression: 'rho * 9.8 * (h / 100)',
      dependencies: ['rho', 'h'],
    },
  ],
  constraints: [
    {
      id: 'c1',
      expression: 'h >= 0',
      errorMessage: 'Độ sâu không thể âm.',
    },
  ],
  charts: [
    {
      id: 'chart1',
      title: 'Đồ thị Áp suất (p) theo Độ sâu (h)',
      xAxis: 'h',
      yAxis: 'p',
      type: 'line',
    },
  ],
  questions: [
    {
      id: 'q1',
      text: 'Em hãy nhận xét mối quan hệ giữa áp suất chất lỏng và độ sâu. Nếu giữ nguyên độ sâu nhưng đổi sang chất lỏng khác (ví dụ nước muối), áp suất thay đổi như thế nào?',
      type: 'short_answer',
      correctAnswer:
        'Áp suất chất lỏng tỉ lệ thuận với độ sâu và với khối lượng riêng chất lỏng: p = ρ.g.h.',
      hints: [
        'Em hãy quan sát bảng dữ liệu: khi độ sâu h tăng lên (giữ nguyên loại chất lỏng), giá trị áp suất p thay đổi như thế nào?',
        'Đồ thị p theo h có dạng đường thẳng đi qua gốc tọa độ không? Điều đó cho biết mối quan hệ tỉ lệ gì giữa p và h?',
        'Hãy liên hệ với công thức p = ρ.g.h — vai trò của ρ (khối lượng riêng chất lỏng) trong công thức này là gì?',
      ],
    },
  ],
};
