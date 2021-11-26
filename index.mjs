#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import handleCP from './handle-copy.mjs';
import { ak, sk} from './key.mjs';

yargs(hideBin(process.argv))
  .command(
    'cp <source> <destination>',
    'copy file or folder to QingStor',
    {
      source: { describe: 'file or folder path', },
      destination: { describe: 'e.g. pek3b:bucket:[prefix]' },
    },
    handleCP,
  )
  .option('ak', {
    type: 'string',
    describe: 'access key',
    default: ak,
  })
  .option('sk', {
    type: 'string',
    describe: 'secret access key',
    default: sk,
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .help('h')
  .parse();
