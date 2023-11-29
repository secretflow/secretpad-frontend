import sha256 from 'crypto-js/sha256';

import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

// import Base64 from 'crypto-js/enc-base64';
// import sha256 from 'crypto-js/256';

// console.log(Base64.stringify(sha256('message')));

export class LoginService extends Model {
  userInfo: User | null = null;

  async login(loginField: { name: string; password: string }) {
    return await API.AuthController.login(
      {},
      {
        name: loginField.name,
        passwordHash: sha256(loginField.password).toString(),
      },
    );
  }

  getUserInfo = async () => {
    if (!this.userInfo) {
      const { data } = await API.UserController.get();
      this.userInfo = data as User;
    }
    return this.userInfo;
  };
}

export interface User {
  token: string;
  platformType: 'EDGE' | 'CENTER';
  name: string;
  ownerType: 'CENTER' | 'EDGE'; // 宿主类型
  ownerId: string; // 	NODE的话这里存nodeId
  deployMode: 'ALL-IN-ONE' | 'MPC' | 'TEE';
}
export interface UserInfo {
  user: User | null;
}
