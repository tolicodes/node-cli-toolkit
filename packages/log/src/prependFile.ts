import { appendFileSync } from "fs";

export default (file: string, data: string): void => {
  appendFileSync(file, data + "\n", {
    flag: "a+",
  });
};
