import {
  DatabaseFilled,
  PieChartFilled,
  LayoutFilled,
  CodeFilled,
  BulbFilled,
  FundFilled,
} from '@ant-design/icons';

export const ComponentIcons: Record<string, React.ReactElement> = {
  default: <DatabaseFilled style={{ color: '#A1AABC' }} />,
  stats: <PieChartFilled style={{ color: '#A1AABC' }} />,
  preprocessing: <LayoutFilled style={{ color: '#A1AABC' }} />,
  feature: <LayoutFilled style={{ color: '#A1AABC' }} />,
  control: <CodeFilled style={{ color: '#A1AABC' }} />,
  'ml.train': <BulbFilled style={{ color: '#A1AABC' }} />,
  'ml.eval': <FundFilled style={{ color: '#A1AABC' }} />,
};
