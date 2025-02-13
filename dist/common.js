"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var INS = {
  GET_VERSION: 0x00
};
var CHUNK_SIZE = 250;
var PAYLOAD_TYPE = {
  INIT: 0x00,
  ADD: 0x01,
  LAST: 0x02
};
var P1_VALUES = {
  ONLY_RETRIEVE: 0x00,
  SHOW_ADDRESS_IN_DEVICE: 0x01
};
var SCHEME = {
  ED25519: 0x00,
  SR25519: 0x01
};
var ERROR_CODE = {
  NoError: 0x9000
};
var ERROR_DESCRIPTION = {
  1: 'U2F: Unknown',
  2: 'U2F: Bad request',
  3: 'U2F: Configuration unsupported',
  4: 'U2F: Device Ineligible',
  5: 'U2F: Timeout',
  14: 'Timeout',
  0x9000: 'No errors',
  0x9001: 'Device is busy',
  0x6802: 'Error deriving keys',
  0x6400: 'Execution Error',
  0x6700: 'Wrong Length',
  0x6982: 'Empty Buffer',
  0x6983: 'Output buffer too small',
  0x6984: 'Data is invalid',
  0x6985: 'Conditions not satisfied',
  0x6986: 'Transaction rejected',
  0x6a80: 'Bad key handle',
  0x6b00: 'Invalid P1/P2',
  0x6d00: 'Instruction not supported',
  0x6e00: 'App does not seem to be open',
  0x6f00: 'Unknown error',
  0x6f01: 'Sign/verify error'
};

function errorCodeToString(statusCode) {
  if (statusCode in ERROR_DESCRIPTION) return ERROR_DESCRIPTION[statusCode];
  return "Unknown Status Code: ".concat(statusCode);
}

function isDict(v) {
  return (0, _typeof2.default)(v) === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

function processErrorResponse(response) {
  if (response) {
    if (isDict(response)) {
      if (Object.prototype.hasOwnProperty.call(response, 'statusCode')) {
        return {
          return_code: response.statusCode,
          error_message: errorCodeToString(response.statusCode)
        };
      }

      if (Object.prototype.hasOwnProperty.call(response, 'return_code') && Object.prototype.hasOwnProperty.call(response, 'error_message')) {
        return response;
      }
    }

    return {
      return_code: 0xffff,
      error_message: response.toString()
    };
  }

  return {
    return_code: 0xffff,
    error_message: response.toString()
  };
}

function getVersion(_x, _x2) {
  return _getVersion.apply(this, arguments);
}

function _getVersion() {
  _getVersion = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(transport, cla) {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", transport.send(cla, INS.GET_VERSION, 0, 0).then(function (response) {
              var errorCodeData = response.slice(-2);
              var returnCode = errorCodeData[0] * 256 + errorCodeData[1]; // 12 bytes + 2 error code

              if (response.length !== 14) {
                return {
                  return_code: 0x6984,
                  error_message: errorCodeToString(0x6984)
                };
              }

              var major = response[1] * 256 + response[2];
              var minor = response[3] * 256 + response[4];
              var patch = response[5] * 256 + response[6];
              var deviceLocked = response[7] === 1; // eslint-disable-next-line no-bitwise

              var targetId = (response[8] << 24) + (response[9] << 16) + (response[10] << 8) + (response[11] << 0);
              return {
                return_code: returnCode,
                error_message: errorCodeToString(returnCode),
                // ///
                test_mode: response[0] !== 0,
                major: major,
                minor: minor,
                patch: patch,
                deviceLocked: deviceLocked,
                target_id: targetId.toString(16)
              };
            }, processErrorResponse));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getVersion.apply(this, arguments);
}

module.exports = {
  CHUNK_SIZE: CHUNK_SIZE,
  INS: INS,
  PAYLOAD_TYPE: PAYLOAD_TYPE,
  P1_VALUES: P1_VALUES,
  SCHEME: SCHEME,
  ERROR_CODE: ERROR_CODE,
  getVersion: getVersion,
  processErrorResponse: processErrorResponse,
  errorCodeToString: errorCodeToString
};