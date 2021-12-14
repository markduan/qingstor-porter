import undici from 'undici';
import fs from 'fs';
import { pipeline } from 'stream';
import { lookup } from 'mime-types';
import { createGzip } from 'zlib';

import getAuthorization from './auth';

type RunParams = {
  filePath: string;
  uploadPath: string;
  ak: string;
  sk: string;
  bucket: string;
  zone: string;
  resolve: () => void;
  reject: (err: Error) => void;
  verbose: boolean;
}

function run({ filePath, uploadPath, ak, sk, bucket, zone, resolve, reject, verbose }: RunParams): void {
  const date = new Date().toUTCString();
  const contentType = lookup(filePath) || 'application/oct-stream';

  const auth = getAuthorization({ uploadPath, date, contentType, ak, sk, bucket });
  const pwd = process.cwd();
  const hostname = `${bucket}.${zone}.qingstor.com`;
  if (verbose) {
    console.log(`uploading ${filePath.slice(pwd.length)}`);
    console.log(`to ${hostname}${uploadPath}`);
  }

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
          console.error('failed to upload file', statusCode);
        }

        return body;
      },
    ),
    (err) => {
      if (err) {
        console.error('err:', err);
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
  verbose: boolean;
}

function uploadOne({ filePath, uploadPath, ak, sk, bucket, zone, verbose }: uploadOneParams): Promise<void> {
  return new Promise((resolve, reject) => {
    run({ filePath, uploadPath, ak, sk, bucket, zone, resolve, reject, verbose });
  });
}

export default uploadOne;
