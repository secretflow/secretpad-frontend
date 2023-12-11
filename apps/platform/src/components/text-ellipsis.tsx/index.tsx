import { Typography } from 'antd';
import React from 'react';

interface IProps {
  children?: React.ReactNode;
  width?: string | number;
  style?: React.CSSProperties;
}

const { Text } = Typography;

export const EllipsisText = (props: IProps) => {
  const { children, width = 180, style } = props;
  if (children === undefined || children === null) {
    return <Typography.Text>{'--'}</Typography.Text>;
  }
  return (
    <Typography.Text
      ellipsis={{
        tooltip: children,
      }}
      style={{
        width,
        ...style,
      }}
    >
      {children}
    </Typography.Text>
  );
};

export const EllipsisMiddle: React.FC<{ suffixCount: number; children: string }> = ({
  suffixCount,
  children,
}) => {
  let start = children;
  let suffix = '';
  if (children && children?.length > suffixCount) {
    start = children?.slice(0, children?.length - suffixCount)?.trim();
    suffix = children?.slice(-suffixCount)?.trim();
  }
  return (
    <Text style={{ width: '100%' }} ellipsis={{ suffix, tooltip: children }}>
      {start}
    </Text>
  );
};
