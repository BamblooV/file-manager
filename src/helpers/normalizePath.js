import path from "node:path";
import { cwd } from 'node:process';

const normalizePath = (target) => {
  return path.isAbsolute(target) ? path.normalize(target) : path.join(cwd(), target);
}

export default normalizePath;