import { getProject } from '@/services/secretpad/ProjectController';
import { Model } from '@/util/valtio-helper';

export class DatatableTreeService extends Model {
  async getProjectNodes(projectId: string): Promise<API.ProjectVO> {
    const result = await getProject({
      projectId,
    });

    return result.data as API.ProjectVO;
  }
}
