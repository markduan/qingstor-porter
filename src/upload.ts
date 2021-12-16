import undici from 'undici';
import fs from 'fs';
import { pipeline } from 'stream';
import { lookup } from 'mime-types';
import { createGzip } from 'zlib';

import getAuthorization from './auth';
import logger from './logger';

type RunParams = {
  filePath: string;
  uploadPath: string;
  ak: string;
  sk: string;
  bucket: string;
  zone: string;
  resolve: () => void;
  reject: (err: Error) => void;
}

function run({ filePath, uploadPath, ak, sk, bucket, zone, resolve, reject }: RunParams): void {
  const date = new Date().toUTCString();
  const contentType = lookup(filePath) || 'application/oct-stream';

  const auth = getAuthorization({ uploadPath, date, contentType, ak, sk, bucket });
  const pwd = process.cwd();
  const hostname = `${bucket}.${zone}.qingstor.com`;
  logger.log(`uploading ${filePath.slice(pwd.length)}`);
  logger.log(`to ${hostname}${uploadPath}`);

  pipeline(
    fs.createReadStream(filePath),
    createGzip(),
    // todo support config qingstor endpoint
    undici.pipeline(
      {
        protocol: 'https:',
        hostname: hostname,
        pathname: uploadPath,
      },
      {
        method: 'PUT',
        headers: {
          date,
          authorization: auth,
          'content-type': contentType,
          'content-encoding': 'gzip',
          'cache-control': 'max-age=2592000',
        },
      },
      ({ statusCode, body }) => {
        if (statusCode >= 400) {
          logger.error('failed to upload file', statusCode);
        }

        return body;
      },
    ),
    (err) => {
      if (err) {
        logger.error('err:', err);
        reject(err);
      }

      resolve();
    },
  );
}

type uploadOneParams = {
  filePath: string;
  uploadPath: string;
  ak: string;
  sk: string;
  bucket: string;
  zone: string;
}

function uploadOne({ filePath, uploadPath, ak, sk, bucket, zone }: uploadOneParams): Promise<void> {
  return new Promise((resolve, reject) => {
    run({ filePath, uploadPath, ak, sk, bucket, zone, resolve, reject });
  });
}

export default uploadOne;
