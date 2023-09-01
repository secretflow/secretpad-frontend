import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export interface IProps {
  codeString: string;
  type: string;
  className?: string;
}

export const ReactHightLighter: React.FC<IProps> = (props) => {
  const { codeString, type, className } = props;

  return (
    <SyntaxHighlighter
      codeTagProps={{ style: { color: 'rgba(0, 0, 0, 0.85)' } }}
      showLineNumbers
      language={type}
      style={docco}
      className={className}
    >
      {codeString}
    </SyntaxHighlighter>
  );
};
