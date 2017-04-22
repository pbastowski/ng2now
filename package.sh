#!/usr/bin/env bash

cd src/api

cat \
polyfills.ts \
common.ts \
options.ts \
set-module.ts \
component.ts \
directive.ts \
injectable.ts \
inject.ts \
pipe.ts \
state.ts \
bootstrap.ts \
exports.ts \
> ../../dist/ng2now.ts

cd ../../dist

tsc -m commonjs -t ES5 --sourceMap ng2now.ts || true

cp ng2now.ts ../src
rm ng2now.ts
