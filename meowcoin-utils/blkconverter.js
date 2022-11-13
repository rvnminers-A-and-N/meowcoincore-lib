'use strict';

// execution
// enable rest in meowcoin.conf 'rest=1' (be sure to disable after)
// node ./meowcoincoin-utils/blkconverter.js

// convert block json from meowcoind format to meowcoincore format

// get ./meowcoincoin-utils/inputs/blk220909.dat by:
// curl 127.0.0.1:8766/rest/block/000000000001a87be937e85123bf209af485cf94b6cae8125dce2f5a9914ecfb.hex | xxd -r -p > ./meowcoincoin-utils/inputs/blk220909.dat

// get ./meowcoincoin-utils/inputs/blk220909.json by
// curl 127.0.0.1:8766/rest/block/000000000001a87be937e85123bf209af485cf94b6cae8125dce2f5a9914ecfb.json > ./meowcoincoin-utils/inputs/blk220909.json

// get ./meowcoincoin-utils/inputs/blk220909.js by manually edit the file

// Manually check if blk220909-meowcoincore.json match with blk220909.json

var meowcoincore = require('..');
var Block = meowcoincore.Block;
var fs = require('fs');

var first8Bytes = new Buffer ([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]); // won't be used in block allocation, just fill with some inane values

var blockBuffer = fs.readFileSync('meowcoincoin-utils/inputs/blk220909.dat');

var meowcoincoreFormatBlockBuffer = Buffer.concat([first8Bytes, blockBuffer]);

var blk = Block.fromRawBlock(meowcoincoreFormatBlockBuffer);

var blkJSON = blk.toJSON();
var blkJSONStr = JSON.stringify(blkJSON, null, 2);

fs.writeFileSync('meowcoincoin-utils/outputs/blk220909-meowcoincore.dat', meowcoincoreFormatBlockBuffer);
fs.writeFileSync('meowcoincoin-utils/outputs/blk220909-meowcoincore.json', blkJSONStr);
