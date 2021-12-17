import { request } from 'undici';
import getAuthorization from './auth';

type Params = {
  uploadPath: string;
  ak: string;
  sk: string;
  bucket: string;
  zone: string;
}

async function isFileExist({ uploadPath, ak, sk, bucket, zone }: Params): Promise<boolean> {
  const date = new Date().toUTCString();
  const auth = getAuthorization({ uploadPath, ak, sk, bucket, method: 'HEAD', date, contentType: '' });
  const hostname = `${bucket}.${zone}.qingstor.com`;
  const urlObj = {
    protocol: 'https:',
    hostname: hostname,
    pathname: uploadPath,
  };

  const { statusCode } = await request(urlObj, {
    method: 'HEAD',
    headers: { date, authorization: auth },
  });

  return statusCode === 200;
}

export default isFileExist;
