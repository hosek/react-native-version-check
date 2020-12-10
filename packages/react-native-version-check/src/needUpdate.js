// @flow
import semver from 'semver';
import isNil from 'lodash.isnil';

import { getVersionInfo } from './versionInfo';
import * as providers from './providers';
import { IVersionAndStoreUrl } from './providers/types';
import {
  getLatestVersion,
  defaultOption as defaultOptionForLatestVersion,
} from './getLatestVersion';

const DELIMITER = '.';

function getVersionWithDepth(version: string, depth: number): string {
  let versionArray = null;
  if (version.indexOf(DELIMITER) === -1) {
    versionArray = [version];
  } else {
    versionArray = version
      .split(DELIMITER)
      .slice(0, Math.min(depth, version.length));
  }
  return [...versionArray, ...[0, 0, 0].slice(0, 3 - versionArray.length)].join(
    DELIMITER
  );
}

export type NeedUpdateOption = {
  currentVersion?: string,
  latestVersion?: string,
  platform?: string,
  url?: string,
  depth?: number,
  ignoreErrors?: boolean,
};

export type NeedUpdateResult = {
  isNeeded: boolean,
  canSkip: boolean,
  storeUrl: string,
  currentVersion: string,
  latestVersion: string,
  minimalVersion: string;
  forcedVersion: string;
  blackList: string[];
};

export default async function needUpdate(
  needUpdateOption: ?NeedUpdateOption = {}
): Promise<NeedUpdateResult> {
  const option = {
    currentVersion: null,
    latestVersion: null,
    depth: Infinity,
    ignoreErrors: true,
    ...defaultOptionForLatestVersion,
    ...needUpdateOption,
  };

  try {
    if (isNil(option.currentVersion)) {
      option.currentVersion = getVersionInfo().getCurrentVersion();
    }

    let vlatestVersion;
    let vminimalVersion;
    let vforcedVersion;
    let vblackList;
    let vproviderStoreUrl = '';

    if (isNil(option.latestVersion)) {
      if (option.provider.getVersion) {
        const {
          version,
          storeUrl,
          minimalVersion,
          forcedVersion,
          blackList
        }: IVersionAndStoreUrl = await option.provider.getVersion(option);
        vlatestVersion = version;
        vproviderStoreUrl = storeUrl;
        vminimalVersion = minimalVersion;
        vforcedVersion = forcedVersion;
        vblackList = blackList;
      }

      if (providers[option.provider]) {
        const { 
          version,
          storeUrl,
          minimalVersion,
          forcedVersion,
          blackList }: IVersionAndStoreUrl = await providers[
          option.provider
        ].getVersion(option);
        vlatestVersion = version;
        vproviderStoreUrl = storeUrl;
        vminimalVersion = minimalVersion;
        vforcedVersion = forcedVersion;
        vblackList = blackList;
      }

      option.latestVersion = vlatestVersion || (await getLatestVersion(option));
    }

    return checkIfUpdateNeeded(
      option.currentVersion,
      option.latestVersion,
      vminimalVersion,
      vforcedVersion,
      vblackList,
      option,
      vproviderStoreUrl
    );
  } catch (e) {
    if (option.ignoreErrors) {
      console.warn(e); // eslint-disable-line no-console
    } else {
      throw e;
    }
  }
}

function canSkip(forcedVersion,currentVersionWithDepth,blackList,option) {
  console.log(option.provider);
  console.log(forcedVersion);
  console.log(currentVersionWithDepth);
  if (isNil(option.provider) || option.provider !== 'jsonFile') {
    return false;
  }
  if(!isNil(blackList) && blackList.includes(currentVersionWithDepth)){
    return false;
  }
  return semver.gt(currentVersionWithDepth,forcedVersion);
}

function isNeeded(latestVersionWithDepth,currentVersionWithDepth,minimalVersion,blackList,option){
  if (isNil(option.provider) || option.provider !== 'jsonFile') {
    return semver.gt(latestVersionWithDepth, currentVersionWithDepth);
  }

  if(!isNil(blackList) && blackList.includes(currentVersionWithDepth)){
    return true;
  }
  return semver.gt(minimalVersion,currentVersionWithDepth);
  
}

function checkIfUpdateNeeded(
  currentVersion,
  latestVersion,
  minimalVersion,
  forcedVersion,
  blackList,
  option,
  providerStoreUrl
) {
  const currentVersionWithDepth = getVersionWithDepth(
    currentVersion,
    option.depth
  );
  const latestVersionWithDepth = getVersionWithDepth(
    latestVersion,
    option.depth
  );

  const response = {
    isNeeded: isNeeded(latestVersionWithDepth,currentVersionWithDepth,minimalVersion,blackList,option),
    canSkip: canSkip(forcedVersion,currentVersionWithDepth,blackList,option),
    storeUrl: providerStoreUrl,
    currentVersion,
    latestVersion,
    minimalVersion,
    forcedVersion,
    blackList
  };

  return Promise.resolve(response);
}
