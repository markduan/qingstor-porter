import glob from 'glob';
import path from 'path';
import fs from 'fs';

import uploadOne from './upload.mjs';

export default async function uploadFolder({ folder, uploadPath, ak, sk, bucket, zone, verbose }) {

  const files = glob.sync(path.join(folder, '**/*'))
    .filter((filePath) => fs.statSync(filePath).isFile())
    .map((filePath) => {
      return {
        filePath,
        uploadPath: path.join(uploadPath, filePath.slice(folder.length)),
      };
    });

  for (const { filePath, uploadPath } of files) {
    await uploadOne({ filePath, uploadPath, ak, sk, bucket, zone, verbose });
  }
}
