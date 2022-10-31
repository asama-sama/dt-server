import { AirQualityUpdateParams } from "../const/datasource";

type JobInitialisorOptions = {
  initialise: boolean;
};

export type JobParams = {
  name: string;
  updateFrequency: number;
  params?: object | AirQualityUpdateParams[];
};

export interface JobInitialisor {
  update(options?: JobInitialisorOptions): Promise<void>;
  params: JobParams;
}
