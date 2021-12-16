import glob from 'glob';
import path from 'path';
import fs from 'fs';

import uploadOne from './upload';

type Params = {
  folder: string;
  uploadPath: string;
  ak: string;
  sk: string;
  bucket: string;
  zone: string;
}

async function uploadFolder({ folder, uploadPath, ak, sk, bucket, zone }: Params): Promise<void> {
  const files = glob.sync(path.join(folder, '**/*'))
    .filter((filePath) => fs.statSync(filePath).isFile())
    .map((filePath) => {
      return {
        filePath,
        uploadPath: path.join(uploadPath, filePath.slice(folder.length)),
      };
    });

  for (const { filePath, uploadPath } of files) {
    await uploadOne({ filePath, uploadPath, ak, sk, bucket, zone });
  }
}

export default uploadFolder;
