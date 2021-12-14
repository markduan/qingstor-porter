import path from 'path';
import { createHmac } from 'crypto';

type Params = {
  uploadPath: string;
  date: string;
  contentType: string;
  ak: string;
  sk: string;
  bucket: string;
}

export default function getAuthorization({ uploadPath, date, contentType, ak, sk, bucket }: Params): string {
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