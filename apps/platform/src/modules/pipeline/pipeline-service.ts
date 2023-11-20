import { Emitter } from '@secretflow/utils';
import { parse } from 'query-string';
import { history } from 'umi';

import {
  createGraph,
  deleteGraph,
  fullUpdateGraph,
  getGraphDetail,
  listGraph,
  updateGraphMeta,
} from '@/services/secretpad/GraphController';
import { CommandRegistry } from '@/util/command';
import { Model } from '@/util/valtio-helper';

import type { Pipeline } from './pipeline-protocol';
import type { PipelineTemplateContribution } from './pipeline-protocol';
import { PipelineTemplateType } from './pipeline-protocol';
import { PipelineCommands } from './pipeline-protocol';

import { getPipelineTemplates } from '.';

export class DefaultPipelineService extends Model {
  pipelines: Pipeline[] = [];
  currentPipeline: Pipeline | undefined;
  pipelineTemplates: PipelineTemplateContribution[];

  static menus = [
    {
      id: PipelineCommands.COPY.id,
      command: PipelineCommands.COPY.id,
      label: PipelineCommands.COPY.label,
      icon: PipelineCommands.COPY.icon,
    },
    {
      id: PipelineCommands.DELETE.id,
      command: PipelineCommands.DELETE.id,
      label: PipelineCommands.DELETE.label,
      icon: PipelineCommands.DELETE.icon,
    },
  ];
  // templatesCount: Record<PipelineTemplateType, number> | {};

  protected readonly onPipelineChangedEmitter = new Emitter<string>();
  readonly onPipelineChanged = this.onPipelineChangedEmitter.on;

  protected readonly onPipelineCreatedEmitter = new Emitter<string>();
  readonly onPipelineCreated = this.onPipelineCreatedEmitter.on;

  constructor() {
    super();
    this.pipelineTemplates = getPipelineTemplates();
    this.registerCommands();
  }

  async getPipelines() {
    const { search } = window.location;
    const { projectId } = parse(search);

    const { data } = await listGraph({ projectId } as { projectId: string });
    this.pipelines = (data as Pipeline[]) || [];

    return data as Pipeline[];
  }

  setCurrentPipeline = (pipelineId: string, pipelineName?: string) => {
    if (!pipelineId) {
      const { projectId, mode } = parse(window.location.search);
      history.replace({
        pathname: '/dag',
        search: `projectId=${projectId}&mode=${mode}`,
      });
      return;
    }
    const pipeline = this.pipelines.find((p) => p.id === pipelineId);
    if (pipeline) this.currentPipeline = pipeline;

    const searchParams = new URL(window.location.toString()).searchParams;
    const currentDagId = searchParams?.get('dagId');
    searchParams.set('dagId', pipelineId);
    history.push(
      {
        pathname: '/dag',
        search: searchParams.toString(),
      },
      pipelineName ? { pipelineName, pipelineId } : { pipelineId },
    );
    if (pipelineId !== currentDagId) {
      this.onPipelineChangedEmitter.fire(pipelineId);
    }
  };

  registerCommands() {
    CommandRegistry.registerCommand(PipelineCommands.COPY.id, {
      execute: (pipeline) => {
        return this.copyPipeline(pipeline.key, pipeline.title);
      },
    });

    CommandRegistry.registerCommand(PipelineCommands.DELETE.id, {
      execute: (pipeline) => {
        return this.deletePipeline(pipeline.key);
      },
    });

    CommandRegistry.registerCommand(PipelineCommands.RENAME.id, {
      execute: (pipeline, name) => {
        const { key } = pipeline;
        // TODO: rename pipeline api
        return this.renamePipeline(key, name);
      },
    });

    CommandRegistry.registerCommand(PipelineCommands.CREATE.id, {
      execute: (type: PipelineTemplateType, projectId?: string) => {
        const template = this.pipelineTemplates.find(
          (t) => t.type === type,
        ) as PipelineTemplateContribution;

        const name =
          type === PipelineTemplateType.BLANK ? '自定义训练流' : `${template.name}模板`;
        return this.createPipeline(name, type, projectId);
      },
    });
  }

  async createPipeline(
    name: string,
    templateType: PipelineTemplateType,
    projectIdParam?: string,
  ) {
    const { search } = window.location;
    const projectId = projectIdParam || (parse(search).projectId as string);

    const { content } = this.pipelineTemplates.find(
      (template) => template.type === templateType,
    ) as PipelineTemplateContribution;

    const { data, status: createStatus } = await createGraph({
      projectId,
      name,
      templateId: templateType,
    });
    if (createStatus?.code !== 0) {
      throw new Error(createStatus?.msg || '创建训练流失败');
    }
    const { graphId: id } = data || {};
    if (!id) throw new Error(createStatus?.msg || '创建训练流失败');
    const { nodes, edges } = content(id);
    const { status } = await fullUpdateGraph({
      projectId,
      graphId: id,
      nodes,
      edges,
    });

    if (status?.code === 0) {
      const res = {
        name,
        id,
        templateType: templateType,
      };
      this.pipelines.push(res);
      this.onPipelineCreatedEmitter.fire(id);
      return res;
    } else {
      throw new Error(status?.msg || '创建训练流失败');
    }
  }

  async copyPipeline(pipelineId: string, pipelineName: string) {
    const newName = `${pipelineName}-copy`;
    const { search } = window.location;
    const { projectId } = parse(search);
    const { data } = await getGraphDetail({
      projectId: projectId as string,
      graphId: pipelineId,
    });

    const pipeline = await this.createPipeline(newName, PipelineTemplateType.BLANK);
    const { id, name } = pipeline;
    if (!data) return pipeline;

    const { nodes, edges } = this.replaceIdInGraph(
      { edges: data.edges || [], nodes: data.nodes || [] },
      id,
    );

    await fullUpdateGraph({
      projectId: projectId as string,
      graphId: id,
      nodes,
      edges,
    });

    this.pipelines.push({ id, name });
    // this.setCurrentPipeline(id, name);
    this.onPipelineCreatedEmitter.fire(id);
    return { id, name };
  }

  async deletePipeline(pipelineId: string) {
    const { search } = window.location;
    const { projectId } = parse(search);

    await deleteGraph({
      projectId: projectId as string,
      graphId: pipelineId,
    });
  }

  async renamePipeline(pipelineId: string, name: string) {
    const { search } = window.location;
    const { projectId } = parse(search);

    await updateGraphMeta({
      projectId: projectId as string,
      graphId: pipelineId,
      name,
    });

    return;
  }

  private replaceIdInGraph(
    graph: {
      nodes: API.GraphNodeDetail[];
      edges: API.GraphEdge[];
    },
    id: string,
  ) {
    const { nodes, edges } = graph;
    const newNodes = nodes.map((node) => {
      const { graphNodeId, inputs, outputs } = node;
      const newGraphNodeId = graphNodeId?.replace(/.*(-node-[0-9]+$)/, id + '$1');
      const newInputs = inputs?.map((i) =>
        i.replace(/.*(-node-[0-9]+-output-[0-9]+$)/, id + '$1'),
      );
      const newOutputs = outputs?.map((o) =>
        o.replace(/.*(-node-[0-9]+-output-[0-9]+$)/, id + '$1'),
      );

      return {
        ...node,
        graphNodeId: newGraphNodeId,
        inputs: newInputs,
        jobId: null,
        outputs: newOutputs,
        results: null,
        status: 'STAGING',
        taskId: null,
      };
    });

    const newEdges = edges.map((edge) => {
      const { edgeId, source, sourceAnchor, target, targetAnchor } = edge;
      const newTarget = target?.replace(/.*(-node-[0-9]+$)/, id + '$1');
      const newSource = source?.replace(/.*(-node-[0-9]+$)/, id + '$1');

      const newSourceAnchor = sourceAnchor?.replace(
        /.*(-node-[0-9]+-output-[0-9]+$)/,
        id + '$1',
      );
      const newTargetAnchor = targetAnchor?.replace(
        /.*(-node-[0-9]+-input-[0-9]+$)/,
        id + '$1',
      );

      const newEdgeId = edgeId?.replace(
        /.*(-node-[0-9]+-output-[0-9]+__).*(-node-[0-9]+-input-[0-9]+$)/,
        `${id}$1${id}$2`,
      );

      return {
        edgeId: newEdgeId,
        target: newTarget,
        targetAnchor: newTargetAnchor,
        source: newSource,
        sourceAnchor: newSourceAnchor,
      };
    });

    return { nodes: newNodes, edges: newEdges };
  }
}
