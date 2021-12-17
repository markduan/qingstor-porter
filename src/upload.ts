import undici from 'undici';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { lookup } from 'mime-types';
import { createGzip } from 'zlib';

import { Options } from './type';
import getAuthorization from './auth';
import logger from './logger';

type params = {
  file: string;
  to: string;
  bucket: string;
  zone: string;
}

async function upload({ file, to, bucket, zone }: params, { ak, sk }: Options): Promise<void> {
  const date = new Date().toUTCString();
  const contentType = lookup(file) || 'application/oct-stream';

  const auth = getAuthorization({ to, date, contentType, ak, sk, bucket, method: 'PUT' });
  const pwd = process.cwd();
  const hostname = `${bucket}.${zone}.qingstor.com`;

  logger.debug(`uploading ${file.slice(pwd.length)}`, `to ${hostname}${to}`);

  await pipeline(
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

export default upload;
