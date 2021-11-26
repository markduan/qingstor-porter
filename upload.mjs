import path from 'path';
import undici from 'undici';
import fs from 'fs';
import { pipeline } from 'stream';
import { createHmac } from 'crypto';
import { lookup } from 'mime-types';
import { createGzip } from 'zlib';

function run({ filePath, uploadPath, ak, sk, bucket, zone, resolve, reject, verbose }) {
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
        reject(err)
      }

      resolve();
    },
  );
}

function uploadOne({ filePath, uploadPath, ak, sk, bucket, zone, verbose }) {
  return new Promise((resolve, reject) => {
    run({ filePath, uploadPath, ak, sk, bucket, zone, resolve, reject, verbose });
  });
}

function getAuthorization({ uploadPath, date, contentType, ak, sk, bucket }) {
  const stringToSign = [
    'PUT',
    '',
    contentType,
    date,
    // ofapkg-demo
    // gd2
    encodeURI(path.join(`/${bucket}`, uploadPath)),
  ].join('\n');
  const hmac = createHmac('sha256', sk);
  const signature = hmac.update(stringToSign).digest('base64');

  return `QS ${ak}:${signature}`;
}

export default uploadOne;
