import undici from 'undici';
import fs from 'fs';
import { Duplex, pipeline } from 'stream';
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
  // resolve: () => void;
  // reject: (err: Error) => void;
}

async function run({ filePath, uploadPath, ak, sk, bucket, zone }: RunParams): Promise<Duplex> {
  const date = new Date().toUTCString();
  const contentType = lookup(filePath) || 'application/oct-stream';

  const auth = getAuthorization({ uploadPath, date, contentType, ak, sk, bucket, method: 'PUT' });
  const pwd = process.cwd();
  const hostname = `${bucket}.${zone}.qingstor.com`;
  logger.log(`uploading ${filePath.slice(pwd.length)}`);
  logger.log(`to ${hostname}${uploadPath}`);

  return pipeline(
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
  );
}

type uploadOneParams = {
  filePath: string;
  uploadPath: string;
  ak: string;
  sk: string;
  bucket: string;
  zone: string;
  force: boolean;
}

function uploadOne({ filePath, uploadPath, ak, sk, bucket, zone }: uploadOneParams): Promise<void> {
  return new Promise(() => {
    return run({ filePath, uploadPath, ak, sk, bucket, zone });
  });
}

export default uploadOne;
