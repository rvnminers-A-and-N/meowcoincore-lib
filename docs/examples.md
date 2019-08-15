# Ravencore examples

## Generate a random address
```javascript
var privateKey = new ravencore.PrivateKey();

var address = privateKey.toAddress();
```

## Generate a address from a SHA256 hash
```javascript
var value = new Buffer('correct horse battery staple');
var hash = ravencore.crypto.Hash.sha256(value);
var bn = ravencore.crypto.BN.fromBuffer(hash);

var address = new ravencore.PrivateKey(bn).toAddress();
```

## Import an address via WIF
```javascript
var wif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';

var address = new ravencore.PrivateKey(wif).toAddress();
```

## Create a Transaction
```javascript
var privateKey = new ravencore.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
var utxo = {
  "txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "outputIndex" : 0,
  "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
  "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
  "satoshis" : 50000
};

var transaction = new ravencore.Transaction()
  .from(utxo)
  .to('1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK', 15000)
  .sign(privateKey);
```

## Sign a ravencoin message
```javascript
var Message = require('ravencore-message');

var privateKey = new ravencore.PrivateKey('L23PpjkBQqpAF4vbMHNfTZAb3KFPBSawQ7KinFTzz7dxq6TZX8UA');
var message = new Message('This is an example of a signed message.');

var signature = message.sign(privateKey);
```

## Verify a ravencoin message
```javascript
var Message = require('ravencore-message');

var address = '13Js7D3q4KvfSqgKN8LpNq57gcahrVc5JZ';
var signature = 'IBOvIfsAs/da1e36W8kw1cQOPqPVXCW5zJgNQ5kI8m57FycZXdeFmeyoIqJSREzE4W7vfDmdmPk0HokuJPvgPPE=';

var verified = new Message('This is an example of a signed message.').verify(address, signature);
 ```

## Create an OP RETURN transaction
```javascript
var privateKey = new ravencore.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
var utxo = {
  "txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "outputIndex" : 0,
  "address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
  "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
  "satoshis" : 50000
};

var transaction = new ravencore.Transaction()
    .from(utxo)
    .addData('ravencore rocks') // Add OP_RETURN data
    .sign(privateKey);
```

## Create a 2-of-3 multisig P2SH address
```javascript
var publicKeys = [
  '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
  '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
  '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9'
];
var requiredSignatures = 2;

var address = new ravencore.Address(publicKeys, requiredSignatures);
```

## Spend from a 2-of-2 multisig P2SH address
```javascript
var privateKeys = [
  new ravencore.PrivateKey('91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjJoQFacbgwmaKkrx'),
  new ravencore.PrivateKey('91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjJoQFacbgww7vXtT')
];
var publicKeys = privateKeys.map(ravencore.PublicKey);
var address = new ravencore.Address(publicKeys, 2); // 2 of 2

var utxo = {
  "txId" : "153068cdd81b73ec9d8dcce27f2c77ddda12dee3db424bff5cafdbe9f01c1756",
  "outputIndex" : 0,
  "address" : address.toString(),
  "script" : new ravencore.Script(address).toHex(),
  "satoshis" : 20000
};

var transaction = new ravencore.Transaction()
    .from(utxo, publicKeys, 2)
    .to('mtoKs9V381UAhUia3d7Vb9GNak8Qvmcsme', 20000)
    .sign(privateKeys);
```

## Create an asset transfer
```javascript

var params = {
  'insight_url': 'https://api.testnet.ravencoin.org/api',
  'asset': 'HELLO_WORLD',
  'amount': 4200000000,
  'asset_from_addresses': 'mgyHoXRvAPk2rf28wDFQu2B2w66Vvvw65Z',
  'rvn_from_address': 'mqjLshMbLdvjGTvWwzVASFyoLpRzQXHXYc',
  'private_keys': ['cNyujqWV5ike5QipxEE771XwNs2CUDcE4iSvECy6RYZzAcLExUgy', 'cVjMjndmrXaAPk4BKPgu1MgqebUuaSERNbBLdxycqpNGG8Tfznz5'],
  'to_address': 'mmamBGYSm4fAJcVfLp1BCRk83Ey9UuUMgu',
  'asset_change_address': 'myGMuarr8TtPmkNxrckvPvjVDfTiWqbZWw',
  'rvn_change_address': 'n1xJxVeCz2gdJuzF5auCufDJ7kkGLHNCSY'
}

var insight = new ravencore.Insight(params.insight_url)

var getAssetUtxos = function (from_address, asset) {
  return new Promise(function (resolve, reject) {
    insight.addrAssetUtxo(from_address, asset, function (res) { resolve(res) })
  })
}

var getRvnUtxos = function (from_address) {
  return new Promise(function (resolve, reject) {
    insight.passthroughGet('/addr/' + from_address + '/utxo', function (res) { resolve(res) })
  })
}

var createTransaction = function (utxos) {
  return new Promise(function (resolve, reject) {
    t = new ravencore.Transaction()
      .from(utxos)
      .to(params.to_address, params.amount, params.asset)
      .change(params.rvn_change_address)
      .change(params.asset_change_address, params.asset)
      .sign(params.private_keys)
    resolve(t)
  })
}

var transaction

Promise.all([
  getAssetUtxos(params.asset_from_addresses, params.asset),
  getRvnUtxos(params.rvn_from_address)
]).then(function (results) {
  return _.flatten(results)
}).then(function (utxos) {
  return createTransaction(utxos)
}).then(function (t) {
  transaction = t
})
```
