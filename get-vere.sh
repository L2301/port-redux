#!/usr/bin/env bash
#
# Downloads Vere (Urbit runtime) binaries for all supported platforms.
# Vere v4.x is the current runtime — see https://github.com/urbit/vere/releases
#
# Usage: ./get-vere.sh [version]
#   version: optional, e.g. "v4.3" (defaults to "latest")
#
# Binaries are placed in resources/{mac,linux,win}/

set -euo pipefail

VERE_VERSION="${1:-latest}"
BASE_URL="https://urbit.org/install"

echo "==> Downloading Vere binaries (${VERE_VERSION})..."

# macOS binaries
echo ""
echo "--- macOS ---"
mkdir -p resources/mac
cd resources/mac
rm -f urbit* vere*

echo "Downloading macOS x86_64..."
curl -fSL "${BASE_URL}/macos-x86_64/${VERE_VERSION}" -o macos-x86_64.tgz
tar -xzf macos-x86_64.tgz
rm macos-x86_64.tgz

echo "Downloading macOS aarch64 (Apple Silicon)..."
curl -fSL "${BASE_URL}/macos-aarch64/${VERE_VERSION}" -o macos-aarch64.tgz
tar -xzf macos-aarch64.tgz
rm macos-aarch64.tgz

echo "macOS binaries:"
ls -la vere* urbit* 2>/dev/null || true
cd ../..

# Linux binaries
echo ""
echo "--- Linux ---"
mkdir -p resources/linux
cd resources/linux
rm -f urbit* vere*

echo "Downloading Linux x86_64..."
curl -fSL "${BASE_URL}/linux-x86_64/${VERE_VERSION}" -o linux-x86_64.tgz
tar -xzf linux-x86_64.tgz
rm linux-x86_64.tgz

echo "Downloading Linux aarch64..."
curl -fSL "${BASE_URL}/linux-aarch64/${VERE_VERSION}" -o linux-aarch64.tgz
tar -xzf linux-aarch64.tgz
rm linux-aarch64.tgz

echo "Linux binaries:"
ls -la vere* urbit* 2>/dev/null || true
cd ../..

# Windows binaries
echo ""
echo "--- Windows ---"
mkdir -p resources/win
cd resources/win
rm -f urbit* vere*

echo "Downloading Windows x86_64..."
# Windows binary is distributed as a zip containing vere-v*.exe
curl -fSL "${BASE_URL}/windows-x86_64/${VERE_VERSION}" -o windows-x86_64.zip
unzip -o windows-x86_64.zip
rm windows-x86_64.zip

echo "Windows binaries:"
ls -la vere* urbit* 2>/dev/null || true
cd ../..

echo ""
echo "==> Done! All Vere binaries downloaded to resources/"
