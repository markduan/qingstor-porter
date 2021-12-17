import undici from 'undici';
import fs from 'fs';
import { Duplex, pipeline } from 'stream';
import { lookup } from 'mime-types';
import { createGzip } from 'zlib';

import { Options } from './type';
import getAuthorization from './auth';
import logger from './logger';

type RunParams = {
  file: string;
  to: string;
  ak: string;
  sk: string;
  bucket: string;
  zone: string;
  force: boolean;
  // resolve: () => void;
  // reject: (err: Error) => void;
}

async function run({ file, to, ak, sk, bucket, zone }: RunParams): Promise<Duplex> {
  const date = new Date().toUTCString();
  const contentType = lookup(file) || 'application/oct-stream';

  const auth = getAuthorization({ to, date, contentType, ak, sk, bucket, method: 'PUT' });
  const pwd = process.cwd();
  const hostname = `${bucket}.${zone}.qingstor.com`;
  logger.log(`uploading ${file.slice(pwd.length)}`);
  logger.log(`to ${hostname}${to}`);

  return pipeline(
    fs.createReadStream(file),
    createGzip(),
    // todo support config qingstor endpoint
    undici.pipeline(
      {
        protocol: 'https:',
        hostname: hostname,
        pathname: to,
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
  file: string;
  to: string;
  bucket: string;
  zone: string;
  // ak: string;
  // sk: string;
  // force: boolean;
}

function uploadOne({ file, to, bucket, zone }: uploadOneParams, { ak, sk, force }: Options): Promise<void> {
  return new Promise(() => {
    return run({ file, to, bucket, zone, ak, sk, force });
  });
}

export default uploadOne;
