import { ChainId } from "@certusone/wormhole-sdk";
import {
  ChainConfigInfo,
  CommonPluginEnv,
  EnvType,
} from "relayer-plugin-interface";
import { loadUntypedEnvs } from "./loadConfig";
import {
  transformPrivateKeys,
  validateCommonEnv,
  validateExecutorEnv,
  validateListenerEnv,
} from "./validateConfig";

export { loadFileAndParseToObject, loadUntypedEnvs } from "./loadConfig";
export { validateStringEnum } from "./validateConfig";

export enum Mode {
  LISTENER = "LISTENER",
  EXECUTOR = "EXECUTOR",
  BOTH = "BOTH",
}
export type NodeURI = string;

export interface CommonEnv {
  logLevel: string;
  promPort?: number;
  readinessPort?: number;
  logDir?: string;
  redisHost: string;
  redisPort: number;
  pluginURIs: NodeURI[];
  envType: EnvType;
  mode: Mode;
  supportedChains: ChainConfigInfo[];
}
// assert CommonEnv is superset of CommonPluginEnv
let _x: CommonPluginEnv = {} as CommonEnv;

export type ListenerEnv = {
  spyServiceHost: string;
  restPort?: number;
  numSpyWorkers: number;
};

export type ExecutorEnv = {
  privateKeys: { [id in ChainId]: string[] };
  actionInterval?: number; // milliseconds between attempting to process actions
};

export type SupportedToken = {
  chainId: ChainId;
  address: string;
};

let loggingEnv: CommonEnv | undefined = undefined;
let executorEnv: ExecutorEnv | undefined = undefined;
let commonEnv: CommonEnv | undefined = undefined;
let listenerEnv: ListenerEnv | undefined = undefined;

export function getCommonEnv(): CommonEnv {
  if (!commonEnv) {
    throw new Error(
      "Tried to get CommonEnv but it does not exist. Has it been loaded yet?"
    );
  }
  return commonEnv;
}

export function getExecutorEnv(): ExecutorEnv {
  if (!executorEnv) {
    throw new Error(
      "Tried to get ExecutorEnv but it does not exist. Has it been loaded yet?"
    );
  }
  return executorEnv;
}

export function getListenerEnv(): ListenerEnv {
  if (!listenerEnv) {
    throw new Error(
      "Tried to get ListenerEnv but it does not exist. Has it been loaded yet?"
    );
  }
  return listenerEnv;
}

export function transforEnvs({
  mode,
  rawCommonEnv,
  rawListenerEnv,
  rawExecutorEnv,
}: {
  mode: Mode;
  rawCommonEnv: any;
  rawListenerEnv: any;
  rawExecutorEnv: any;
}) {
  return {
    mode,
    rawCommonEnv,
    rawListenerEnv,
    rawExecutorEnv: {
      ...rawExecutorEnv,
      privateKeys: transformPrivateKeys(rawExecutorEnv.privateKeys),
    },
  };
}

export function validateEnvs(input: {
  mode: Mode;
  rawCommonEnv: any;
  rawListenerEnv: any;
  rawExecutorEnv: any;
}) {
  console.log("Validating envs...");
  try {
    input = transforEnvs(input);
  } catch (e) {
  }
  commonEnv = validateCommonEnv(input.rawCommonEnv);
  if (input.rawExecutorEnv) {
    executorEnv = validateExecutorEnv(input.rawExecutorEnv);
  }
  if (input.rawListenerEnv) {
    listenerEnv = validateListenerEnv(input.rawListenerEnv);
  }
  console.log("Validated envs");
}