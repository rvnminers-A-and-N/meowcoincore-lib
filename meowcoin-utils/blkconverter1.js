'use strict';

// execution
// enable rest in meowcoin.conf 'rest=1' (be sure to disable after)
// node ./meowcoin-utils/blkconverter1.js

// convert block json from meowcoind format to meowcoincore format

// get ./meowcoin-utils/inputs/blk220909.dat by:
// curl 127.0.0.1:8766/rest/block/00000058bcc33dea08b53691edb9e49a9eb8bac36a0db17eb5a7588860b1f590.hex | xxd -r -p > ./meowcoin-utils/inputs/blk1.dat

// get ./meowcoin-utils/inputs/blk220909.json by
// curl 127.0.0.1:8766/rest/block/00000058bcc33dea08b53691edb9e49a9eb8bac36a0db17eb5a7588860b1f590.json > ./meowcoin-utils/inputs/blk1.json

// get ./meowcoin-utils/inputs/blk1.js by manually edit the file

// Manually check if blk1-meowcoincore.json match with blk1.json

var meowcoincore = require('..');
var Block = meowcoincore.Block;
var fs = require('fs');

var first8Bytes = new Buffer ([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]); // won't be used in block allocation, just fill with some inane values

var blockBuffer = fs.readFileSync('meowcoin-utils/inputs/blk1.dat');

var meowcoincoreFormatBlockBuffer = Buffer.concat([first8Bytes, blockBuffer]);

var blk = Block.fromRawBlock(meowcoincoreFormatBlockBuffer);

var blkJSON = blk.toJSON();
var blkJSONStr = JSON.stringify(blkJSON, null, 2);

fs.writeFileSync('meowcoin-utils/outputs/blk1-meowcoincore.dat', meowcoincoreFormatBlockBuffer);
fs.writeFileSync('meowcoin-utils/outputs/blk1-meowcoincore.json', blkJSONStr);
