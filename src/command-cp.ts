import fs from 'fs';
import path from 'path';

import uploadFolder from './upload-folder.js';
import uploadFile from './upload-file';
import { Options } from './type';

function commandCP(source: string, destination: string, options: Options): Promise<void> {
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
  const to = path.join('/', prefix, basename);

  if (stat.isDirectory()) {
    return uploadFolder({ folder: absPath, prefix: to, bucket, zone }, options);
  }

  return uploadFile({ file: absPath, to, bucket, zone }, options);
}

export default commandCP;
