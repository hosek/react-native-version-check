// @flow
import { getVersionInfo } from '../versionInfo';

import { IProvider, IVersionAndStoreUrl } from './types';

export type JsonFileGetVersionOption = {
  packageName?: string,
  fetchOptions?: any,
  ignoreErrors?: boolean,
};

export interface IJsonFileProvider extends IProvider {
  getVersion: JsonFileGetVersionOption => Promise<IVersionAndStoreUrl>;
}

function error(text: string) {
  return {
    message:
      "Parse Error.",
    text,
  };
}

class JsonFileProvider implements IProvider {
  getVersion(option: JsonFileGetVersionOption): Promise<IVersionAndStoreUrl> {
    const opt = option || {};
    try {
      if (!opt.packageName) {
        opt.packageName = getVersionInfo().getPackageName();
      }

      return fetch(opt.url, opt.fetchOptions)
        .then(res => res.json())
        .then(json => {
            const platformVersions = json[opt.platform];
            console.log();
            const latestVersion = platformVersions?.latest;
            const minimalVersion = platformVersions?.minimal;
            const forcedVersion = platformVersions?.forced;
            const blackList = platformVersions?.blacklist;
            const storeUrl = platformVersions?.url
            return Promise.resolve({
              version: latestVersion,
              minimalVersion,
              forcedVersion,
              blackList,
              storeUrl
              });
        });
    } catch (e) {
      if (opt.ignoreErrors) {
        console.warn(e); // eslint-disable-line no-console
      } else {
        throw e;
      }
    }
  }
}

export default new JsonFileProvider();
