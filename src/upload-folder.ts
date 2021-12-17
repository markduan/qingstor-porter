import glob from 'glob';
import path from 'path';
import fs from 'fs';

import { Options } from './type';
import uploadOne from './upload';

type Params = {
  folder: string;
  to: string;
  bucket: string;
  zone: string;
}

async function uploadFolder({ folder, to, bucket, zone }: Params, options: Options): Promise<void> {
  const files = glob.sync(path.join(folder, '**/*'))
    .filter((filePath) => fs.statSync(filePath).isFile())
    .map((filePath) => {
      return {
        filePath,
        uploadPath: path.join(to, filePath.slice(folder.length)),
      };
    });

  for (const { filePath, uploadPath } of files) {
    await uploadOne({ file: filePath, to: uploadPath, bucket, zone }, options);
  }
}

export default uploadFolder;
