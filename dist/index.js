"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _common = require("./common");

var _config = require("./config");

/** ******************************************************************************
 *  (c) 2019 ZondaX GmbH
 *  (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */
var bip39 = require('bip39');

var hash = require('hash.js');

var bip32ed25519 = require('bip32-ed25519');

var bs58 = require('bs58');

var blake = require('blakejs');

var HDPATH_0_DEFAULT = 0x8000002c;
var INS = {
  GET_VERSION: 0x00,
  GET_ADDR: 0x01,
  SIGN: 0x02,
  // Allow list related commands
  ALLOWLIST_GET_PUBKEY: 0x90,
  ALLOWLIST_SET_PUBKEY: 0x91,
  ALLOWLIST_GET_HASH: 0x92,
  ALLOWLIST_UPLOAD: 0x93
};

var TetcoreApp = /*#__PURE__*/function () {
  function TetcoreApp(transport, cla, slip0044) {
    (0, _classCallCheck2.default)(this, TetcoreApp);

    if (!transport) {
      throw new Error('Transport has not been defined');
    }

    this.transport = transport;
    this.cla = cla;
    this.slip0044 = slip0044;
  }

  (0, _createClass2.default)(TetcoreApp, [{
    key: "getVersion",
    value: function () {
      var _getVersion2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return (0, _common.getVersion)(this.transport, this.cla);

              case 3:
                return _context.abrupt("return", _context.sent);

              case 6:
                _context.prev = 6;
                _context.t0 = _context["catch"](0);
                return _context.abrupt("return", (0, _common.processErrorResponse)(_context.t0));

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 6]]);
      }));

      function getVersion() {
        return _getVersion2.apply(this, arguments);
      }

      return getVersion;
    }()
  }, {
    key: "appInfo",
    value: function () {
      var _appInfo = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this.transport.send(0xb0, 0x01, 0, 0).then(function (response) {
                  var errorCodeData = response.slice(-2);
                  var returnCode = errorCodeData[0] * 256 + errorCodeData[1];
                  var result = {};
                  var appName = 'err';
                  var appVersion = 'err';
                  var flagLen = 0;
                  var flagsValue = 0;

                  if (response[0] !== 1) {
                    // Ledger responds with format ID 1. There is no spec for any format != 1
                    result.error_message = 'response format ID not recognized';
                    result.return_code = 0x9001;
                  } else {
                    var appNameLen = response[1];
                    appName = response.slice(2, 2 + appNameLen).toString('ascii');
                    var idx = 2 + appNameLen;
                    var appVersionLen = response[idx];
                    idx += 1;
                    appVersion = response.slice(idx, idx + appVersionLen).toString('ascii');
                    idx += appVersionLen;
                    var appFlagsLen = response[idx];
                    idx += 1;
                    flagLen = appFlagsLen;
                    flagsValue = response[idx];
                  }

                  return {
                    return_code: returnCode,
                    error_message: (0, _common.errorCodeToString)(returnCode),
                    // //
                    appName: appName,
                    appVersion: appVersion,
                    flagLen: flagLen,
                    flagsValue: flagsValue,
                    // eslint-disable-next-line no-bitwise
                    flag_recovery: (flagsValue & 1) !== 0,
                    // eslint-disable-next-line no-bitwise
                    flag_signed_mcu_code: (flagsValue & 2) !== 0,
                    // eslint-disable-next-line no-bitwise
                    flag_onboarded: (flagsValue & 4) !== 0,
                    // eslint-disable-next-line no-bitwise
                    flag_pin_validated: (flagsValue & 128) !== 0
                  };
                }, _common.processErrorResponse));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function appInfo() {
        return _appInfo.apply(this, arguments);
      }

      return appInfo;
    }()
  }, {
    key: "getAddress",
    value: function () {
      var _getAddress = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(account, change, addressIndex) {
        var requireConfirmation,
            scheme,
            bip44Path,
            p1,
            p2,
            _args3 = arguments;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                requireConfirmation = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : false;
                scheme = _args3.length > 4 && _args3[4] !== undefined ? _args3[4] : _common.SCHEME.ED25519;
                bip44Path = TetcoreApp.serializePath(this.slip0044, account, change, addressIndex);
                p1 = 0;
                if (requireConfirmation) p1 = 1;
                p2 = 0;
                if (!isNaN(scheme)) p2 = scheme;
                return _context3.abrupt("return", this.transport.send(this.cla, INS.GET_ADDR, p1, p2, bip44Path).then(function (response) {
                  var errorCodeData = response.slice(-2);
                  var errorCode = errorCodeData[0] * 256 + errorCodeData[1];
                  return {
                    pubKey: response.slice(0, 32).toString('hex'),
                    address: response.slice(32, response.length - 2).toString('ascii'),
                    return_code: errorCode,
                    error_message: (0, _common.errorCodeToString)(errorCode)
                  };
                }, _common.processErrorResponse));

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getAddress(_x, _x2, _x3) {
        return _getAddress.apply(this, arguments);
      }

      return getAddress;
    }()
  }, {
    key: "signSendChunk",
    value: function () {
      var _signSendChunk = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(chunkIdx, chunkNum, chunk) {
        var scheme,
            payloadType,
            p2,
            _args4 = arguments;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                scheme = _args4.length > 3 && _args4[3] !== undefined ? _args4[3] : _common.SCHEME.ED25519;
                payloadType = _common.PAYLOAD_TYPE.ADD;

                if (chunkIdx === 1) {
                  payloadType = _common.PAYLOAD_TYPE.INIT;
                }

                if (chunkIdx === chunkNum) {
                  payloadType = _common.PAYLOAD_TYPE.LAST;
                }

                p2 = 0;
                if (!isNaN(scheme)) p2 = scheme;
                return _context4.abrupt("return", this.transport.send(this.cla, INS.SIGN, payloadType, p2, chunk, [_common.ERROR_CODE.NoError, 0x6984, 0x6a80]).then(function (response) {
                  var errorCodeData = response.slice(-2);
                  var returnCode = errorCodeData[0] * 256 + errorCodeData[1];
                  var errorMessage = (0, _common.errorCodeToString)(returnCode);
                  var signature = null;

                  if (returnCode === 0x6a80 || returnCode === 0x6984) {
                    errorMessage = response.slice(0, response.length - 2).toString('ascii');
                  } else if (response.length > 2) {
                    signature = response.slice(0, response.length - 2);
                  }

                  return {
                    signature: signature,
                    return_code: returnCode,
                    error_message: errorMessage
                  };
                }, _common.processErrorResponse));

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function signSendChunk(_x4, _x5, _x6) {
        return _signSendChunk.apply(this, arguments);
      }

      return signSendChunk;
    }()
  }, {
    key: "sign",
    value: function () {
      var _sign = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6(account, change, addressIndex, message) {
        var _this = this;

        var scheme,
            chunks,
            _args6 = arguments;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                scheme = _args6.length > 4 && _args6[4] !== undefined ? _args6[4] : _common.SCHEME.ED25519;
                chunks = TetcoreApp.signGetChunks(this.slip0044, account, change, addressIndex, message);
                return _context6.abrupt("return", this.signSendChunk(1, chunks.length, chunks[0], scheme).then( /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5(result) {
                    var i;
                    return _regenerator.default.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            i = 1;

                          case 1:
                            if (!(i < chunks.length)) {
                              _context5.next = 10;
                              break;
                            }

                            _context5.next = 4;
                            return _this.signSendChunk(1 + i, chunks.length, chunks[i], scheme);

                          case 4:
                            result = _context5.sent;

                            if (!(result.return_code !== _common.ERROR_CODE.NoError)) {
                              _context5.next = 7;
                              break;
                            }

                            return _context5.abrupt("break", 10);

                          case 7:
                            i += 1;
                            _context5.next = 1;
                            break;

                          case 10:
                            return _context5.abrupt("return", {
                              return_code: result.return_code,
                              error_message: result.error_message,
                              signature: result.signature
                            });

                          case 11:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  }));

                  return function (_x11) {
                    return _ref.apply(this, arguments);
                  };
                }(), _common.processErrorResponse));

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function sign(_x7, _x8, _x9, _x10) {
        return _sign.apply(this, arguments);
      }

      return sign;
    }() /// Allow list related commands. They are NOT available on all apps

  }, {
    key: "getAllowlistPubKey",
    value: function () {
      var _getAllowlistPubKey = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", this.transport.send(this.cla, INS.ALLOWLIST_GET_PUBKEY, 0, 0).then(function (response) {
                  var errorCodeData = response.slice(-2);
                  var returnCode = errorCodeData[0] * 256 + errorCodeData[1];
                  console.log(response);
                  var pubkey = response.slice(0, 32); // 32 bytes + 2 error code

                  if (response.length !== 34) {
                    return {
                      return_code: 0x6984,
                      error_message: (0, _common.errorCodeToString)(0x6984)
                    };
                  }

                  return {
                    return_code: returnCode,
                    error_message: (0, _common.errorCodeToString)(returnCode),
                    pubkey: pubkey
                  };
                }, _common.processErrorResponse));

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getAllowlistPubKey() {
        return _getAllowlistPubKey.apply(this, arguments);
      }

      return getAllowlistPubKey;
    }()
  }, {
    key: "setAllowlistPubKey",
    value: function () {
      var _setAllowlistPubKey = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8(pk) {
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt("return", this.transport.send(this.cla, INS.ALLOWLIST_SET_PUBKEY, 0, 0, pk).then(function (response) {
                  var errorCodeData = response.slice(-2);
                  var returnCode = errorCodeData[0] * 256 + errorCodeData[1];
                  return {
                    return_code: returnCode,
                    error_message: (0, _common.errorCodeToString)(returnCode)
                  };
                }, _common.processErrorResponse));

              case 1:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function setAllowlistPubKey(_x12) {
        return _setAllowlistPubKey.apply(this, arguments);
      }

      return setAllowlistPubKey;
    }()
  }, {
    key: "getAllowlistHash",
    value: function () {
      var _getAllowlistHash = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9() {
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt("return", this.transport.send(this.cla, INS.ALLOWLIST_GET_HASH, 0, 0).then(function (response) {
                  var errorCodeData = response.slice(-2);
                  var returnCode = errorCodeData[0] * 256 + errorCodeData[1];
                  console.log(response);
                  var hash = response.slice(0, 32); // 32 bytes + 2 error code

                  if (response.length !== 34) {
                    return {
                      return_code: 0x6984,
                      error_message: (0, _common.errorCodeToString)(0x6984)
                    };
                  }

                  return {
                    return_code: returnCode,
                    error_message: (0, _common.errorCodeToString)(returnCode),
                    hash: hash
                  };
                }, _common.processErrorResponse));

              case 1:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getAllowlistHash() {
        return _getAllowlistHash.apply(this, arguments);
      }

      return getAllowlistHash;
    }()
  }, {
    key: "uploadSendChunk",
    value: function () {
      var _uploadSendChunk = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee10(chunkIdx, chunkNum, chunk) {
        var payloadType;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                payloadType = _common.PAYLOAD_TYPE.ADD;

                if (chunkIdx === 1) {
                  payloadType = _common.PAYLOAD_TYPE.INIT;
                }

                if (chunkIdx === chunkNum) {
                  payloadType = _common.PAYLOAD_TYPE.LAST;
                }

                return _context10.abrupt("return", this.transport.send(this.cla, INS.ALLOWLIST_UPLOAD, payloadType, 0, chunk, [_common.ERROR_CODE.NoError]).then(function (response) {
                  var errorCodeData = response.slice(-2);
                  var returnCode = errorCodeData[0] * 256 + errorCodeData[1];
                  var errorMessage = (0, _common.errorCodeToString)(returnCode);
                  return {
                    return_code: returnCode,
                    error_message: errorMessage
                  };
                }, _common.processErrorResponse));

              case 4:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function uploadSendChunk(_x13, _x14, _x15) {
        return _uploadSendChunk.apply(this, arguments);
      }

      return uploadSendChunk;
    }()
  }, {
    key: "uploadAllowlist",
    value: function () {
      var _uploadAllowlist = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee12(message) {
        var _this2 = this;

        var chunks;
        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                chunks = [];
                chunks.push(Buffer.from([0]));
                chunks.push.apply(chunks, (0, _toConsumableArray2.default)(TetcoreApp.GetChunks(message)));
                return _context12.abrupt("return", this.uploadSendChunk(1, chunks.length, chunks[0]).then( /*#__PURE__*/function () {
                  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee11(result) {
                    var i;
                    return _regenerator.default.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            if (!(result.return_code !== _common.ERROR_CODE.NoError)) {
                              _context11.next = 2;
                              break;
                            }

                            return _context11.abrupt("return", {
                              return_code: result.return_code,
                              error_message: result.error_message
                            });

                          case 2:
                            i = 1;

                          case 3:
                            if (!(i < chunks.length)) {
                              _context11.next = 12;
                              break;
                            }

                            _context11.next = 6;
                            return _this2.uploadSendChunk(1 + i, chunks.length, chunks[i]);

                          case 6:
                            result = _context11.sent;

                            if (!(result.return_code !== _common.ERROR_CODE.NoError)) {
                              _context11.next = 9;
                              break;
                            }

                            return _context11.abrupt("break", 12);

                          case 9:
                            i += 1;
                            _context11.next = 3;
                            break;

                          case 12:
                            return _context11.abrupt("return", {
                              return_code: result.return_code,
                              error_message: result.error_message
                            });

                          case 13:
                          case "end":
                            return _context11.stop();
                        }
                      }
                    }, _callee11);
                  }));

                  return function (_x17) {
                    return _ref2.apply(this, arguments);
                  };
                }(), _common.processErrorResponse));

              case 4:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function uploadAllowlist(_x16) {
        return _uploadAllowlist.apply(this, arguments);
      }

      return uploadAllowlist;
    }()
  }], [{
    key: "serializePath",
    value: function serializePath(slip0044, account, change, addressIndex) {
      if (!Number.isInteger(account)) throw new Error('Input must be an integer');
      if (!Number.isInteger(change)) throw new Error('Input must be an integer');
      if (!Number.isInteger(addressIndex)) throw new Error('Input must be an integer');
      var buf = Buffer.alloc(20);
      buf.writeUInt32LE(0x8000002c, 0);
      buf.writeUInt32LE(slip0044, 4);
      buf.writeUInt32LE(account, 8);
      buf.writeUInt32LE(change, 12);
      buf.writeUInt32LE(addressIndex, 16);
      return buf;
    }
  }, {
    key: "GetChunks",
    value: function GetChunks(message) {
      var chunks = [];
      var buffer = Buffer.from(message);

      for (var i = 0; i < buffer.length; i += _common.CHUNK_SIZE) {
        var end = i + _common.CHUNK_SIZE;

        if (i > buffer.length) {
          end = buffer.length;
        }

        chunks.push(buffer.slice(i, end));
      }

      return chunks;
    }
  }, {
    key: "signGetChunks",
    value: function signGetChunks(slip0044, account, change, addressIndex, message) {
      var chunks = [];
      var bip44Path = TetcoreApp.serializePath(slip0044, account, change, addressIndex);
      chunks.push(bip44Path);
      chunks.push.apply(chunks, (0, _toConsumableArray2.default)(TetcoreApp.GetChunks(message)));
      return chunks;
    }
  }]);
  return TetcoreApp;
}();

function newKusamaApp(transport) {
  return new TetcoreApp(transport, _config.CLA.KUSAMA, _config.SLIP0044.KUSAMA);
}

function newTetcoinApp(transport) {
  return new TetcoreApp(transport, _config.CLA.TETCOIN, _config.SLIP0044.TETCOIN);
}

function newPolymeshApp(transport) {
  return new TetcoreApp(transport, _config.CLA.POLYMESH, _config.SLIP0044.POLYMESH);
}

function newDockApp(transport) {
  return new TetcoreApp(transport, _config.CLA.DOCK, _config.SLIP0044.DOCK);
}

function newCentrifugeApp(transport) {
  return new TetcoreApp(transport, _config.CLA.CENTRIFUGE, _config.SLIP0044.CENTRIFUGE);
}

function newEdgewareApp(transport) {
  return new TetcoreApp(transport, _config.CLA.EDGEWARE, _config.SLIP0044.EDGEWARE);
}

function sha512(data) {
  var digest = hash.sha512().update(data).digest();
  return Buffer.from(digest);
}

function hmac256(key, data) {
  var digest = hash.hmac(hash.sha256, key).update(data).digest();
  return Buffer.from(digest);
}

function hmac512(key, data) {
  var digest = hash.hmac(hash.sha512, key).update(data).digest();
  return Buffer.from(digest);
}

function ss58hash(data) {
  var hash = blake.blake2bInit(64, null);
  blake.blake2bUpdate(hash, Buffer.from('SS58PRE'));
  blake.blake2bUpdate(hash, data);
  return blake.blake2bFinal(hash);
}

function ss58_encode(prefix, pubkey) {
  if (pubkey.byteLength !== 32) {
    return null;
  }

  var data = Buffer.alloc(35);
  data[0] = prefix;
  pubkey.copy(data, 1);
  var hash = ss58hash(data.slice(0, 33));
  data[33] = hash[0];
  data[34] = hash[1];
  return bs58.encode(data);
}

function root_node_slip10(master_seed) {
  var data = Buffer.alloc(1 + 64);
  data[0] = 0x01;
  master_seed.copy(data, 1);
  var c = hmac256('ed25519 seed', data);
  var I = hmac512('ed25519 seed', data.slice(1));
  var kL = I.slice(0, 32);
  var kR = I.slice(32);

  while ((kL[31] & 32) !== 0) {
    I.copy(data, 1);
    I = hmac512('ed25519 seed', data.slice(1));
    kL = I.slice(0, 32);
    kR = I.slice(32);
  }

  kL[0] &= 248;
  kL[31] &= 127;
  kL[31] |= 64;
  return Buffer.concat([kL, kR, c]);
}

function hdKeyDerivation(mnemonic, password, slip0044, accountIndex, changeIndex, addressIndex, ss58prefix) {
  if (!bip39.validateMnemonic(mnemonic)) {
    console.log('Invalid mnemonic');
    return null;
  }

  var seed = bip39.mnemonicToSeedSync(mnemonic, password);
  var node = root_node_slip10(seed);
  node = bip32ed25519.derivePrivate(node, HDPATH_0_DEFAULT);
  node = bip32ed25519.derivePrivate(node, slip0044);
  node = bip32ed25519.derivePrivate(node, accountIndex);
  node = bip32ed25519.derivePrivate(node, changeIndex);
  node = bip32ed25519.derivePrivate(node, addressIndex);
  var kL = node.slice(0, 32);
  var sk = sha512(kL).slice(0, 32);
  sk[0] &= 248;
  sk[31] &= 127;
  sk[31] |= 64;
  var pk = bip32ed25519.toPublic(sk);
  var address = ss58_encode(ss58prefix, pk);
  return {
    sk: kL,
    pk: pk,
    address: address
  };
}

module.exports = {
  hdKeyDerivation: hdKeyDerivation,
  newKusamaApp: newKusamaApp,
  newTetcoinApp: newTetcoinApp,
  newPolymeshApp: newPolymeshApp,
  newDockApp: newDockApp,
  newCentrifugeApp: newCentrifugeApp,
  newEdgewareApp: newEdgewareApp
};