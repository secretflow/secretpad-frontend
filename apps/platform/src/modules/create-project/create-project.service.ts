import { message } from 'antd';
import { history } from 'umi';

import { LoginService } from '@/modules/login/login.service';
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
  getTeeNodeList,
} from '@/services/secretpad/ProjectController';
import { Model, getModel } from '@/util/valtio-helper';

import { ComputeModeType } from '../p2p-project-list/components/common';

export type Datatable = API.DatatableVO;
export type TeeNode = API.NodeVO;
export class CreateProjectService extends Model {
  loginService = getModel(LoginService);

  project: string[] = [];

  nodeList: API.NodeVO[] = [];

  dataTable: Datatable = {};

  pipelineTemplates: PipelineTemplateContribution[];

  nodeService: NodeService;

  pipelineService: DefaultPipelineService;

  teeNodeList: TeeNode[] = [];

  edgeNodeList: API.NodeVO[] = [];

  constructor() {
    super();
    // this.commands = getModel(CommandRegistry);
    this.nodeService = getModel(NodeService);
    this.pipelineService = getModel(DefaultPipelineService);
    this.pipelineTemplates = getPipelineTemplates();
    this.getTeeNodeList();
  }

  async getNodeList() {
    this.nodeList = await this.nodeService.listNode();
  }

  async getEdgeNodeList(nodeId: string) {
    this.edgeNodeList = await this.nodeService.edgeListNode(nodeId);
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
    // center 平台admin 账号 还是使用Alice，和bob。
    if (
      this.loginService.userInfo?.platformType === 'CENTER' &&
      this.loginService.userInfo?.ownerType === 'CENTER'
    ) {
      const aliceData =
        this.nodeList?.find((i) => i.nodeId === 'alice')?.datatables || [];
      const bobData = this.nodeList?.find((i) => i.nodeId === 'bob')?.datatables || [];
      await Promise.all([
        addProjectDatatable({
          projectId: projectId,
          nodeId: 'alice',
          datatableId: aliceData[0].datatableId,
          configs: [
            { colName: 'id1', isAssociateKey: true, isProtection: true },
            { colName: 'y', isLabelKey: true },
          ],
        }),
        addProjectDatatable({
          projectId: projectId,
          nodeId: 'bob',
          datatableId: bobData[0].datatableId,
          configs: [
            { colName: 'id2', isAssociateKey: true, isProtection: true },
            { colName: 'y', isLabelKey: true },
          ],
        }),
      ]);
    }
    // center edge用户账号，如果有alice或bob才去添加，没有不添加
    if (
      this.loginService.userInfo?.platformType === 'CENTER' &&
      this.loginService.userInfo?.ownerType === 'EDGE' &&
      this.loginService.userInfo?.ownerId
    ) {
      const alice = this.edgeNodeList?.find((i) => i.nodeId === 'alice');
      const bob = this.edgeNodeList?.find((i) => i.nodeId === 'bob');
      const list = [];
      if (alice) {
        list.push(
          addProjectDatatable({
            projectId: projectId,
            nodeId: 'alice',
            datatableId: (alice?.datatables || [])[0].datatableId,
            configs: [
              { colName: 'id1', isAssociateKey: true, isProtection: true },
              { colName: 'y', isLabelKey: true },
            ],
          }),
        );
      }
      if (bob) {
        list.push(
          addProjectDatatable({
            projectId: projectId,
            nodeId: 'bob',
            datatableId: (bob?.datatables || [])[0].datatableId,
            configs: [
              { colName: 'id2', isAssociateKey: true, isProtection: true },
              { colName: 'y', isLabelKey: true },
            ],
          }),
        );
      }
      await Promise.all(list);
    }
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
    const { data, status: createProjectStatus } = await createProject({
      name: projectName,
      description,
      computeMode,
      teeNodeId: (computeMode === ComputeModeType.TEE &&
        this.teeNodeList[0].nodeId) as string,
    });

    if (createProjectStatus?.code && createProjectStatus.code !== 0) {
      throw new Error(createProjectStatus.msg || '创建失败');
    }

    // 添加节点到项目 edge 账号创建的时候node已经默认添加，所以过滤掉当前账号的节点
    if (
      this.loginService.userInfo?.platformType === 'CENTER' &&
      this.loginService.userInfo?.ownerType === 'EDGE' &&
      this.loginService.userInfo?.ownerId
    ) {
      const newNodeList = nodes.filter(
        (node) => node !== this.loginService?.userInfo?.ownerId,
      );
      await this.addNodeToProject(data?.projectId as string, newNodeList || []);
    } else {
      await this.addNodeToProject(data?.projectId as string, nodes || []);
    }

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

    history.push(
      {
        pathname: '/dag',
        search: `projectId=${data?.projectId}&mode=${computeMode}`,
      },
      {
        origin: 'project-management',
      },
    );
  };

  getTeeNodeList = async () => {
    const { data } = await getTeeNodeList();
    this.teeNodeList = data as TeeNode[];
  };
}
