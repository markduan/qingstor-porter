
import { Options } from './type';
import logger from './logger';
import isFileExist from './is-file-exist';
import upload from './upload';

type uploadOneParams = {
  file: string;
  to: string;
  bucket: string;
  zone: string;
}

async function uploadFile({ file, to, bucket, zone }: uploadOneParams, options: Options): Promise<void> {
  const has = await isFileExist({ to, bucket, zone, ak: options.ak, sk: options.sk });
  if (has && !options.force) {
    logger.warn('file already exist, if you still want to upload, please -f');
    return;
  }

  return upload({ file, to, bucket, zone }, options);
}

export default uploadFile;
