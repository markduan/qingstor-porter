import path from 'path';
import { createHmac } from 'crypto';

type Params = {
  method: 'HEAD' | 'PUT';
  to: string;
  date: string;
  contentType: string;
  ak: string;
  sk: string;
  bucket: string;
}

export default function getAuthorization({ method, to, date, contentType, ak, sk, bucket }: Params): string {
  const stringToSign = [
    method,
    '',
    contentType,
    date,
    // ofapkg-demo
    // gd2
    encodeURI(path.join(`/${bucket}`, to)),
  ].join('\n');
  const hmac = createHmac('sha256', sk);
  const signature = hmac.update(stringToSign).digest('base64');

  return `QS ${ak}:${signature}`;
}
