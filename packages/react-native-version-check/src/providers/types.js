// @flow
export interface IProvider {
  getVersion: any => Promise<string>;
}

export interface IVersionAndStoreUrl {
  version: string;
  minimalVersion: string;
  forcedVersion: string;
  blackList: string[];
  storeUrl: string;
}