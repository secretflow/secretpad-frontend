import { message } from 'antd';

import { listGraph } from '@/services/secretpad/GraphController';
import {
  listJob,
  listProject,
  deleteProject,
  updateProject,
} from '@/services/secretpad/ProjectController';
import { Model } from '@/util/valtio-helper';

export type ProjectVO = API.ProjectVO;

export class ProjectListService extends Model {
  projectList: ProjectVO[] = [];
  projectListLoading = false;

  getListProject = async () => {
    this.projectListLoading = true;
    const { data } = await listProject();
    this.projectList = (data || []) as ProjectVO[];
    this.projectListLoading = false;
    return this.projectList.reverse();
  };

  getPipelines = async (projectId: string) => {
    const pipelineList = await listGraph({
      projectId,
    });
    return pipelineList.data || [];
  };

  getJobs = async (projectId: string) => {
    const jobsList = await listJob({
      projectId,
      pageNum: 1,
      pageSize: 10,
    });

    return jobsList.data || [];
  };

  deleteProject = async (projectId: string) => {
    const { status } = await deleteProject({ projectId });
    return status as API.SecretPadResponseSecretPadResponseStatus;
  };

  updateProject = async (params: {
    projectId: string;
    name: string;
    description: string;
  }) => {
    const { status } = await updateProject(params);
    if (status && status.code === 0) {
      message.success('项目名称修改成功');
    }
  };
}
