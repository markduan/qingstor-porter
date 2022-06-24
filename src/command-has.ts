import logger from './logger.js';
import { Options } from './type';
import isFileExist from './is-file-exist';

function commandHas(target: string, options: Options): void {
  const [zone, bucket, filePath] = target.split(':');
  isFileExist({
    ak: options.ak,
    sk: options.sk,
    to: filePath,
    bucket,
    zone,
  })
    .then((isExist: boolean) => {
      // eslint-disable-next-line no-console
      console.log(isExist);
    })
    .catch((err) => {
      logger.error(err);
    });
}

export default commandHas;
