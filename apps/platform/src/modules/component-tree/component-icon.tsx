import {
  BulbFilled,
  CodeFilled,
  DatabaseFilled,
  FundFilled,
  LayoutFilled,
  PieChartFilled,
} from '@ant-design/icons';

export const ComponentIcons: Record<string, React.ReactElement> = {
  default: <DatabaseFilled style={{ color: '#A1AABC' }} />,
  database: <DatabaseFilled style={{ color: '#A1AABC' }} />,
  chart: <PieChartFilled style={{ color: '#A1AABC' }} />,
  preprocessing: <LayoutFilled style={{ color: '#A1AABC' }} />,
  control: <CodeFilled style={{ color: '#A1AABC' }} />,
  'ml.linear': <BulbFilled style={{ color: '#A1AABC' }} />,
  'ml.boost': <BulbFilled style={{ color: '#A1AABC' }} />,
  stats: <FundFilled style={{ color: '#A1AABC' }} />,
};
