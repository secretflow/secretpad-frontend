import { message } from 'antd';
import sha256 from 'crypto-js/sha256';

import type { PadMode, Platform } from '@/components/platform-wrapper';
import API from '@/services/secretpad';
import { listNode } from '@/services/secretpad/InstController';
import { updatePwd } from '@/services/secretpad/UserController';
import { Model } from '@/util/valtio-helper';

// import Base64 from 'crypto-js/enc-base64';
// import sha256 from 'crypto-js/256';

// console.log(Base64.stringify(sha256('message')));

export class LoginService extends Model {
  userInfo: User | null = null;

  /** AUTONOMY 模式 - 机构下的所有节点 */
  autonomyNodeList: API.NodeVO[] = [];

  async login(loginField: { name: string; password: string }) {
    return await API.AuthController.login({
      name: loginField.name,
      passwordHash: sha256(loginField.password).toString(),
    });
  }

  getUserInfo = async () => {
    if (!this.userInfo) {
      const { data } = await API.UserController.get();
      this.userInfo = data as User;
    }
    return this.userInfo;
  };

  getUserInfoAsync = async () => {
    const { data } = await API.UserController.get();
    this.userInfo = data as User;
    return this.userInfo;
  };

  resetUserPwd = async (
    name: string,
    currentPwd: string,
    newPwd: string,
    verifiedNewPwd: string,
  ) => {
    const res = await updatePwd({
      name: name,
      oldPasswordHash: sha256(currentPwd).toString(),
      newPasswordHash: sha256(newPwd).toString(),
      confirmPasswordHash: sha256(verifiedNewPwd).toString(),
    });
    return res?.status;
  };

  /** AUTONOMY 模式下获取机构下所有节点列表 */
  getAutonomyNodeList = async () => {
    const { status, data } = await listNode();
    if (status && status.code === 0) {
      this.autonomyNodeList = data || [];
    } else {
      message.error(status?.msg);
    }
  };
}

export interface User {
  token: string;
  platformType: Platform; // 'EDGE' | 'CENTER' | 'AUTONOMY';
  name: string;
  ownerType: 'CENTER' | 'EDGE'; // 宿主类型
  ownerId: string; // 	NODE的话这里存nodeId
  deployMode: PadMode; // 'ALL-IN-ONE' | 'MPC' | 'TEE';
}
export interface UserInfo {
  user: User | null;
}
