#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import handleCP from './handle-copy.js';
import { Options } from './type';

// function getConfig(configPath: string): Partial<{ ak: string; sk: string; }> {
//   if (!configPath) {
//     return {};
//   }

//   const content = fs.readFileSync(path.join(process.cwd(), configPath), { encoding: 'utf-8' });
//   return JSON.parse(content);
// }

const argv = yargs(hideBin(process.argv))
  .options({
    ak: { type: 'string', describe: 'access key' },
    sk: { type: 'string', describe: 'secret access key' },
    verbose: {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
      global: true,
    },
    force: {
      alias: 'f',
      type: 'boolean',
      description: 'Run cp force',
      global: true,
    },
    config: {
      alias: 'c',
      type: 'string',
      describe: 'json or yaml config file path',
      global: true,
    },
  })
  .command(
    'cp',
    'copy file or folder to QingStor',
    // {
    //   source: { describe: 'file or folder path', type: 'string' },
    //   destination: { describe: 'e.g. pek3b:bucket:[prefix]', type: 'string' },
    // },
  )
  .help('h').parseSync();

const options: Options = {
  ak: argv.ak || process.env.QINGSTOR_PORTER_CONFIG_AK || '',
  sk: argv.sk || process.env.QINGSTOR_PORTER_CONFIG_SK || '',
  verbose: !!argv.verbose,
  force: !!argv.force,
};

if (!options.ak || !options.sk) {
  console.error('ak and sk required');
  process.exit(1);
}

if (argv._[0] === 'cp') {
  if (argv._.length < 3) {
    console.error('missing source or destination');
    process.exit(1);
  }

  const sources = argv._.slice(1, -1);
  const destination = argv._[argv._.length - 1];

  Promise.all(
    sources.map((source) => {
      return handleCP(String(source), String(destination), options);
    }),
  );
}
