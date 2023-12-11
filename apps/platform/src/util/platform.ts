/* eslint-disable default-case */
/* eslint-disable no-nested-ternary */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const LANGUAGE_DEFAULT = 'en';

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isLinuxSnap = false;
let _isNative = false;
let _isWeb = false;
let _isIOS = false;
let _locale: string | undefined;
let _language: string = LANGUAGE_DEFAULT;
let _translationsConfigFile: string | undefined;
let _userAgent: string | undefined;

interface NLSConfig {
  locale: string;
  availableLanguages: Record<string, string>;
  _translationsConfigFile: string;
}

export type IProcessEnvironment = Record<string, string>;

export interface INodeProcess {
  platform: 'win32' | 'linux' | 'darwin';
  env: IProcessEnvironment;
  nextTick: any; //Function;
  versions?: {
    electron?: string;
  };
  sandboxed?: boolean; // Electron
  type?: string;
  cwd: () => string;
}
declare const process: INodeProcess;
declare const global: any;

interface INavigator {
  userAgent: string;
  language: string;
  maxTouchPoints?: number;
}
declare const navigator: INavigator;
declare const self: any;

const _globals =
  typeof self === 'object' ? self : typeof global === 'object' ? global : ({} as any);

let nodeProcess: INodeProcess | undefined;
if (typeof process !== 'undefined') {
  // Native environment (non-sandboxed)
  nodeProcess = process;
} else if (typeof _globals.vscode !== 'undefined') {
  // Native environment (sandboxed)
  nodeProcess = _globals.vscode.process;
}

const isElectronRenderer =
  typeof nodeProcess?.versions?.electron === 'string' &&
  nodeProcess.type === 'renderer';
export const isElectronSandboxed = isElectronRenderer && nodeProcess?.sandboxed;
export const browserCodeLoadingCacheStrategy:
  | 'none'
  | 'code'
  | 'bypassHeatCheck'
  | 'bypassHeatCheckAndEagerCompile'
  | undefined = (() => {
  // Always enabled when sandbox is enabled
  if (isElectronSandboxed) {
    return 'bypassHeatCheck';
  }

  // Otherwise, only enabled conditionally
  const env = nodeProcess?.env.ENABLE_VSCODE_BROWSER_CODE_LOADING;
  if (typeof env === 'string') {
    if (
      env === 'none' ||
      env === 'code' ||
      env === 'bypassHeatCheck' ||
      env === 'bypassHeatCheckAndEagerCompile'
    ) {
      return env;
    }

    return 'bypassHeatCheck';
  }

  return undefined;
})();
export const isPreferringBrowserCodeLoad =
  typeof browserCodeLoadingCacheStrategy === 'string';

// Web environment
if (typeof navigator === 'object' && !isElectronRenderer) {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf('Windows') >= 0;
  _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
  _isIOS =
    (_userAgent.indexOf('Macintosh') >= 0 ||
      _userAgent.indexOf('iPad') >= 0 ||
      _userAgent.indexOf('iPhone') >= 0) &&
    !!navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 0;
  _isLinux = _userAgent.indexOf('Linux') >= 0;
  _isWeb = true;
  _locale = navigator.language;
  _language = _locale;
}

// Native environment
else if (typeof nodeProcess === 'object') {
  _isWindows = nodeProcess.platform === 'win32';
  _isMacintosh = nodeProcess.platform === 'darwin';
  _isLinux = nodeProcess.platform === 'linux';
  _isLinuxSnap = _isLinux && !!nodeProcess.env.SNAP && !!nodeProcess.env.SNAP_REVISION;
  _locale = LANGUAGE_DEFAULT;
  _language = LANGUAGE_DEFAULT;
  const rawNlsConfig = nodeProcess.env.VSCODE_NLS_CONFIG;
  if (rawNlsConfig) {
    try {
      const nlsConfig: NLSConfig = JSON.parse(rawNlsConfig);
      const resolved = nlsConfig.availableLanguages['*'];
      _locale = nlsConfig.locale;
      // VSCode's default language is 'en'
      _language = resolved || LANGUAGE_DEFAULT;
      _translationsConfigFile = nlsConfig._translationsConfigFile;
    } catch (e) {
      //
    }
  }
  _isNative = true;
}

// Unknown environment
else {
  console.error('Unable to resolve platform.');
}

export enum Platform {
  Web,
  Mac,
  Linux,
  Windows,
}
export function PlatformToString(platform: Platform) {
  switch (platform) {
    case Platform.Web:
      return 'Web';
    case Platform.Mac:
      return 'Mac';
    case Platform.Linux:
      return 'Linux';
    case Platform.Windows:
      return 'Windows';
  }
}

let _platform: Platform = Platform.Web;
if (_isMacintosh) {
  _platform = Platform.Mac;
} else if (_isWindows) {
  _platform = Platform.Windows;
} else if (_isLinux) {
  _platform = Platform.Linux;
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;
export const isLinuxSnap = _isLinuxSnap;
export const isNative = _isNative;
export const isWeb = _isWeb;
export const isIOS = _isIOS;
export const platform = _platform;
export const userAgent = _userAgent;

/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */
export const language = _language;

/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */
export const locale = _locale;

/**
 * The translatios that are available through language packs.
 */
export const translationsConfigFile = _translationsConfigFile;

export const globals: any = _globals;

interface ISetImmediate {
  (callback: (...args: any[]) => void): void;
}

export const setImmediate: ISetImmediate = (function defineSetImmediate() {
  if (globals.setImmediate) {
    return globals.setImmediate.bind(globals);
  }
  if (typeof globals.postMessage === 'function' && !globals.importScripts) {
    interface IQueueElement {
      id: number;
      callback: () => void;
    }
    const pending: IQueueElement[] = [];
    globals.addEventListener('message', (e: MessageEvent) => {
      if (e.data && e.data.vscodeSetImmediateId) {
        for (let i = 0, len = pending.length; i < len; i++) {
          const candidate = pending[i];
          if (candidate.id === e.data.vscodeSetImmediateId) {
            pending.splice(i, 1);
            candidate.callback();
            return;
          }
        }
      }
    });
    let lastId = 0;
    return (callback: () => void) => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback,
      });
      globals.postMessage({ vscodeSetImmediateId: myId }, '*');
    };
  }
  if (nodeProcess && typeof nodeProcess.nextTick === 'function') {
    return nodeProcess.nextTick.bind(nodeProcess);
  }
  const _promise = Promise.resolve();
  return (callback: (...args: any[]) => void) => _promise.then(callback);
})();

export enum OperatingSystem {
  Windows = 1,
  Macintosh = 2,
  Linux = 3,
}
export const OS =
  _isMacintosh || _isIOS
    ? OperatingSystem.Macintosh
    : _isWindows
    ? OperatingSystem.Windows
    : OperatingSystem.Linux;

let _isLittleEndian = true;
let _isLittleEndianComputed = false;
export function isLittleEndian(): boolean {
  if (!_isLittleEndianComputed) {
    _isLittleEndianComputed = true;
    const test = new Uint8Array(2);
    test[0] = 1;
    test[1] = 2;
    const view = new Uint16Array(test.buffer);
    _isLittleEndian = view[0] === (2 << 8) + 1;
  }
  return _isLittleEndian;
}

export type AvatarInfo = {
  onlineLink: string;
  localLink: string;
  offlineLink: string;
  localStorageTag: string;
};

export function getImgLink(avatarInfo: AvatarInfo) {
  const storageKey = avatarInfo.localStorageTag;
  const storageVal = localStorage.getItem(storageKey);

  let imgLink = '';

  if (!storageVal) {
    // 问题：首次任务，要是断网，就获取不到在线图片，无法 log（在线图片 = log）
    // 解决方式：
    // 断网的时候，拿本地图片，但不会到 localstorage
    // 只有获取在线图片，才标记 localstorage
    const img = new Image();
    img.src = avatarInfo.onlineLink;

    img.onerror = () => {
      imgLink = avatarInfo.localLink;
    };

    img.onload = () => {
      imgLink = avatarInfo.onlineLink;

      localStorage.setItem(storageKey, 'true');
    };
  } else {
    imgLink = avatarInfo.localLink;
  }

  return imgLink;
}
