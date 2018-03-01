#!/usr/bin/env bash

# set -x # verbose debugging

IN_FILE='index.js'
OUT_FILE='index-compat.js'
BABEL_PATH='./node_modules/babel-cli/bin/babel.js'

# Get script location, resolve if a link.
export SCRIPT_ROOT_ENV_SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SCRIPT_ROOT_ENV_SOURCE" ]; do
  export SCRIPT_ROOT_DIR="$( cd -P "$( dirname "$SCRIPT_ROOT_ENV_SOURCE" )" && pwd )"
  export SCRIPT_ROOT_ENV_SOURCE="$(readlink "$SCRIPT_ROOT_ENV_SOURCE")"
  [[ ${SCRIPT_ROOT_ENV_SOURCE} != /* ]] && SCRIPT_ROOT_ENV_SOURCE="$SCRIPT_ROOT_DIR/$SCRIPT_ROOT_ENV_SOURCE"
done
export SCRIPT_ROOT_DIR="$( cd -P "$( dirname "$SCRIPT_ROOT_ENV_SOURCE" )" && pwd )"

pushd "$SCRIPT_ROOT_DIR" || { echo 'Could not enter primary directory.' ; exit 1; }

if [ ! -f "$BABEL_PATH" ]; then
    npm i || { echo 'NPM Installation Failed.' ; exit 1; }
fi

echo "/* The following JavaScript file was preprocessed from $IN_FILE via Babel for support on older Node installations. */" > "$OUT_FILE.tmp"
"$BABEL_PATH" "$IN_FILE" --presets es2017,es2016,es2015 | sed '1d' >> "$OUT_FILE.tmp"  || { echo 'Babel Processing Failed.' ;  rm "$OUT_FILE.tmp"; exit 1; }
mv "$OUT_FILE.tmp" "$OUT_FILE"

popd || { echo 'Could not return from primary directory.' ; exit 1; }
