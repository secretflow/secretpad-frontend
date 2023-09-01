import sha256 from 'crypto-js/sha256';

import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

// import Base64 from 'crypto-js/enc-base64';
// import sha256 from 'crypto-js/256';

// console.log(Base64.stringify(sha256('message')));

export class LoginService extends Model {
  async login(loginField: { name: string; password: string }) {
    return await API.AuthController.login(
      {},
      {
        name: loginField.name,
        passwordHash: sha256(loginField.password).toString(),
      },
    );
  }
}
