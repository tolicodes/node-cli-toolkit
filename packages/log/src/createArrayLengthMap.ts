import { DataMap } from ".";
interface IDataCounts {
  [key: string]: number;
}

// takes an map of data objects, extracts arrays, and lists their lengths
export default (data: DataMap): IDataCounts => {
  type ArrayDataEntry = [string, any[]];

  const arrayDataEntries = Object.entries(data).filter(([, value]) =>
    Array.isArray(value)
  ) as ArrayDataEntry[];

  return arrayDataEntries.reduce(
    (previousValue, [key, value]: ArrayDataEntry) => {
      previousValue[key] = value.length;
      return previousValue;
    },
    {} as IDataCounts
  );
};
