import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export const readJsonFiles = (
  folderPath: string
): (readonly [fname: string, data: any])[] => {
  const folderFullPath = path.resolve(__dirname, folderPath);
  const files = readdirSync(folderFullPath);
  const jsonFiles = files.filter((file) => path.extname(file) === ".json");
  const jsonObjects = jsonFiles.map((file) => {
    const filePath = path.join(folderFullPath, file);
    const jsonAsString = readFileSync(filePath).toString();
    return [path.basename(filePath), JSON.parse(jsonAsString)] as const;
  });
  return jsonObjects;
};

export const readJson = (p: string): any => {
  const jsonAsString = readFileSync(path.resolve(__dirname, p)).toString();
  return JSON.parse(jsonAsString);
};
