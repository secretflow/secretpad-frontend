import { PipelineCommands } from './pipeline-protocol';

export const getPipelineCommandFeeback = (commandId: string, pipelineName: string) => {
  let msg;
  switch (commandId) {
    case PipelineCommands.COPY.id:
      msg = `「${pipelineName}」创建成功`;
      break;
    case PipelineCommands.DELETE.id:
      msg = `「${pipelineName}」删除成功`;
      break;
    case PipelineCommands.CREATE.id:
      msg = `「${pipelineName}」创建成功`;
      break;

    default:
      break;
  }

  return msg;
};
