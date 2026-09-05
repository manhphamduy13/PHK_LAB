import { SimulationSpecification } from '../../types/simulation';

export const densitySimulation: SimulationSpecification = {
  id: 'density-01',
  type: 'DensitySimulation',
  version: '1.0',
  title: 'Khảo sát khối lượng riêng của vật rắn',
  description:
    'Học sinh đo khối lượng và thể tích của một vật rắn (bằng phương pháp thả chìm trong bình chia độ), từ đó xác định khối lượng riêng của vật.',
  subject: 'Vật lí',
  grade: 8,

  parameters: [
    {
      id: 'm',
      label: 'Khối lượng vật (cân điện tử)',
      symbol: 'm',
      unit: 'g',
      type: 'number',
      min: 10,
      max: 500,
      default: 120,
      step: 1,
      description: 'Khối lượng vật đo được trên cân điện tử.',
    },
    {
      id: 'V',
      label: 'Thể tích vật (nước dâng lên trong bình chia độ)',
      symbol: 'V',
      unit: 'cm³',
      type: 'number',
      min: 5,
      max: 250,
      default: 45,
      step: 1,
      description:
        'Thể tích nước dâng lên khi thả chìm vật = thể tích của vật.',
    },
    {
      id: 'D',
      label: 'Khối lượng riêng',
      symbol: 'D',
      unit: 'g/cm³',
      type: 'number',
      min: 0,
      max: 30,
      default: 0,
      step: 0.01,
      description: 'Được tính tự động: D = m / V.',
    },
  ],
  objects: [
    { id: 'object', type: 'solid_block', properties: { shape: 'irregular' } },
    { id: 'cylinder', type: 'graduated_cylinder' },
  ],
  formulas: [
    { id: 'f1', target: 'D', expression: 'm / V', dependencies: ['m', 'V'] },
  ],
  constraints: [
    {
      id: 'c1',
      expression: 'V > 0',
      errorMessage: 'Thể tích phải lớn hơn 0. Hãy thả vật vào bình chia độ.',
    },
  ],
  charts: [
    {
      id: 'chart1',
      title: 'Đồ thị Khối lượng (m) theo Thể tích (V)',
      xAxis: 'V',
      yAxis: 'm',
      type: 'scatter',
    },
  ],
  questions: [
    {
      id: 'q1',
      text:
        'Khi thay đổi khối lượng và thể tích vật (nhưng cùng một chất liệu), em có nhận xét gì về tỉ số m/V qua các lần đo? Hãy ghi lại kết luận của em về khối lượng riêng.',
      type: 'short_answer',
      correctAnswer:
        'Tỉ số m/V (khối lượng riêng) gần như không đổi với cùng một chất liệu, dù khối lượng và thể tích của vật thay đổi.',
      hints: [
        'Em hãy đo ít nhất 3 vật khác kích thước nhưng cùng làm bằng một chất liệu, rồi so sánh các giá trị D tính được trong bảng dữ liệu.',
        'So sánh tỉ số m/V giữa các lần đo: chúng có gần bằng nhau không, dù m và V khác nhau?',
        'Liên hệ với công thức D = m/V: khối lượng riêng có phụ thuộc vào kích thước (khối lượng, thể tích) của vật hay chỉ phụ thuộc vào chất liệu?',
      ],
    },
  ],
};
