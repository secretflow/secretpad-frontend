import { Typography } from 'antd';
// import React from 'react';

const { Text } = Typography;
interface Props {
  suffixCount: number;
  children: string | undefined;
  maxWidth?: number | string;
  className?: string;
  showTip?: boolean;
  style?: Record<string, any>;
  onClick?: (e?: any) => void;
}

export const EllipsisMiddles = (props: Props) => {
  const {
    suffixCount,
    children,
    maxWidth,
    className,
    onClick,
    style,
    showTip = true,
  } = props;
  let start;
  let suffix;
  if (children && children?.length > suffixCount) {
    start = children?.slice(0, children?.length - suffixCount)?.trim();
    suffix = children?.slice(-suffixCount)?.trim();
  } else {
    start = children;
    suffix = '';
  }

  return (
    <Text
      onClick={onClick}
      className={className}
      style={{
        ...style,
        maxWidth,
        width: '100%',
        minWidth: `${suffixCount + 2}em`,
      }}
      ellipsis={{
        suffix,
        tooltip: showTip ? <span>{children}</span> : null,
      }}
    >
      {start}
    </Text>
  );
};
