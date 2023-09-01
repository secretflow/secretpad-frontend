import { history } from 'umi';

import { NodeService } from '@/modules/node';
import { getPipelineTemplates } from '@/modules/pipeline';
import type { PipelineTemplateContribution } from '@/modules/pipeline/pipeline-protocol';
import { PipelineTemplateType } from '@/modules/pipeline/pipeline-protocol';
import { DefaultPipelineService } from '@/modules/pipeline/pipeline-service';
import { getDatatable } from '@/services/secretpad/DatatableController';
import {
  addProjectDatatable,
  addProjectInst,
  addProjectNode,
  createProject,
} from '@/services/secretpad/ProjectController';
import { Model, getModel } from '@/util/valtio-helper';

export type Datatable = API.DatatableVO;

export class CreateProjectService extends Model {
  project: string[] = [];

  nodeList: API.NodeVO[] = [];

  dataTable: Datatable = {};

  pipelineTemplates: PipelineTemplateContribution[];

  nodeService: NodeService;

  pipelineService: DefaultPipelineService;

  constructor() {
    super();
    // this.commands = getModel(CommandRegistry);
    this.nodeService = getModel(NodeService);
    this.pipelineService = getModel(DefaultPipelineService);
    this.pipelineTemplates = getPipelineTemplates();
  }

  async getNodeList() {
    this.nodeList = await this.nodeService.listNode();
  }

  getDatatableInfo = async (nodeId: string, datatableId: string) => {
    const { data } = await getDatatable({
      nodeId,
      datatableId,
    });
    this.dataTable = data as API.DatatableVO;
  };

  async addInstToProject(projectId: string) {
    await Promise.all([
      addProjectInst({
        projectId: projectId,
        instId: 'alice',
      }),
      addProjectInst({
        projectId: projectId,
        instId: 'bob',
      }),
    ]);
  }

  async addNodeToProject(projectId: string, nodeList: string[]) {
    const tasks = nodeList.map((item) => {
      return addProjectNode({
        projectId: projectId,
        nodeId: item,
      });
    });
    await Promise.all(tasks);
  }

  async addTablesToProject(projectId: string) {
    const aliceData =
      this.nodeList?.find((i) => i.nodeId === 'alice')?.datatables || [];
    const bobData = this.nodeList?.find((i) => i.nodeId === 'bob')?.datatables || [];
    await Promise.all([
      addProjectDatatable({
        projectId: projectId,
        nodeId: 'alice',
        datatableId: aliceData[0].datatableId,
        configs: [
          { colName: 'id1', isAssociateKey: true },
          { colName: 'y', isLabelKey: true },
        ],
      }),
      addProjectDatatable({
        projectId: projectId,
        nodeId: 'bob',
        datatableId: bobData[0].datatableId,
        configs: [
          { colName: 'id2', isAssociateKey: true },
          { colName: 'y', isLabelKey: true },
        ],
      }),
    ]);
  }

  createProject = async (
    value: {
      projectName: string;
      templateId: PipelineTemplateType;
      description: string;
      computeMode: string;
      nodes: string[];
    },
    notGuidePage = false,
  ) => {
    const { projectName, templateId, description, computeMode, nodes } = value;

    await this.getNodeList();
    const { data } = await createProject({
      name: projectName,
      description,
      computeMode,
    });

    // 添加节点到项目
    await this.addNodeToProject(data?.projectId as string, nodes || []);

    await this.addInstToProject(data?.projectId as string);

    // 自定义训练流不需要添加默认数据表
    if (templateId !== PipelineTemplateType.BLANK) {
      await this.addTablesToProject(data?.projectId as string);
    }

    const template = this.pipelineTemplates.find(
      (t) => t.type === templateId,
    ) as PipelineTemplateContribution;

    const name =
      templateId === PipelineTemplateType.BLANK
        ? '自定义训练流'
        : `${template.name}模板`;
    this.pipelineService.createPipeline(name, templateId, data?.projectId);

    history.push({
      pathname: '/dag',
      search: `projectId=${data?.projectId}`,
    });
  };
}
