import { mergeTimeSeries } from "./timeseries-merge";

self.onmessage = (event: MessageEvent) => {
  const { data, secondary } = event.data as {
    data: { date: string; count: number }[] | undefined;
    secondary: { date: string; count: number }[] | undefined;
  };
  self.postMessage(mergeTimeSeries(data, secondary));
};
