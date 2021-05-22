# ledger-tetcoin (JS Integration)

This package provides a basic client library to communicate with Tetcore Apps running in a Ledger Nano S/X devices

Additionally, it provides a hd_key_derivation function to retrieve the keys that Ledger apps generate with
BIP32-ED25519. Warning: the hd_key_derivation function is not audited and depends on external pacakges. We recommend
using the official Tetcore Ledger apps in recovery mode.

# Run Tests

- Prepare your Ledger device (https://github.com/zondax/ledger-kusama)

  - Prepare as development device:

  - Build & load the Kusama app

    - Load the Kusama App

- Install all dependencies and run tests

```shell script
yarn install
yarn test:integration
```
