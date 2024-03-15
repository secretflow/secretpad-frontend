import { NodeIndexOutlined } from '@ant-design/icons';
import { history } from 'umi';

export const PipelineTitleComponent = () => {
  const { pipelineName } = (history.location?.state as any) || {};
  return (
    <>
      <NodeIndexOutlined />「{pipelineName || 'title'}」提交模型
    </>
  );
};
