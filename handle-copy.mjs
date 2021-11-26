import fs from 'fs';
import path from 'path';

import uploadFolder from './upload-folder.mjs';
import uploadOne from './upload.mjs';

export default function handleCP({ source, destination, ak, sk, verbose }) {
  // remove the last slash
  const _trimSource = source.replace(/\/$/, '');
  let absPath = _trimSource;
  if (!path.isAbsolute(absPath)) {
    absPath = path.join(process.cwd(), absPath);
  }

  const [zone, bucket, prefix = ''] =  destination.split(':')
  if (!zone || !bucket) {
    process.exit(1);
  }

  const stat = fs.statSync(absPath);
  const basename = path.basename(_trimSource);
  const uploadPath = path.join('/', prefix, basename);

  if (stat.isDirectory()) {
    return uploadFolder({ folder: absPath, uploadPath, ak, sk, bucket, zone, verbose });
  }

  return uploadOne({ filePath: absPath, uploadPath, ak, sk, bucket, zone, verbose });
}
