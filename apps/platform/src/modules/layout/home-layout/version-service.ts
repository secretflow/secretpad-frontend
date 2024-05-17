import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

export type Version = {
  name: string;
  version: string;
};

export class VersionService extends Model {
  versionList: Version[] = [];
  loading = false;

  getVersion = async () => {
    this.loading = true;
    // const deployMode = this.loginService.userInfo?.deployMode;
    // if (!deployMode) return;
    const { status, data = {} } = await API.ComponentVersionController.listVersion();
    this.loading = false;
    if (status && status.code === 0) {
      this.versionList = Object.keys(data).map((key) => ({
        name: key,
        version: data[key],
      }));
    }
  };
}
