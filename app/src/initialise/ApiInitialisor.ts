import { ApiConsts } from "../const/api";

export interface ApiInitialisor {
  update(): Promise<void>;
  setupDb(): Promise<void>;
  apiConsts: ApiConsts;
}
