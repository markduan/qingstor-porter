import glob from 'glob';
import path from 'path';
import fs from 'fs';

import { Options } from './type';
import uploadFile from './upload-file';
import logger from './logger';

type Params = {
  folder: string;
  prefix: string;
  bucket: string;
  zone: string;
}

async function uploadFolder({ folder, prefix, bucket, zone }: Params, options: Options): Promise<void> {
  const files = glob.sync(path.join(folder, '**/*'))
    .filter((file) => fs.statSync(file).isFile());

  logger.info('find %d files to be upload', files.length);

  for (const file of files) {
    const uploadPath = path.join(prefix, file.slice(folder.length));
    await uploadFile({ file, to: uploadPath, bucket, zone }, options);
  }
}

export default uploadFolder;
