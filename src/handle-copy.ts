import fs from 'fs';
import path from 'path';

import uploadFolder from './upload-folder.js';
import uploadOne from './upload';
import { Options } from './type';

function handleCP(source: string, destination: string, { ak, sk }: Options): Promise<void> {
  // remove the last slash
  const _trimSource = source.replace(/\/$/, '');
  let absPath = _trimSource;
  if (!path.isAbsolute(absPath)) {
    absPath = path.join(process.cwd(), absPath);
  }

  const [zone, bucket, prefix = ''] = destination.split(':');
  if (!zone || !bucket) {
    throw new Error('zone and bucket required');
  }

  const stat = fs.statSync(absPath);
  const basename = path.basename(_trimSource);
  const uploadPath = path.join('/', prefix, basename);

  if (stat.isDirectory()) {
    return uploadFolder({ folder: absPath, uploadPath, ak, sk, bucket, zone });
  }

  return uploadOne({ filePath: absPath, uploadPath, ak, sk, bucket, zone });
}

export default handleCP;
