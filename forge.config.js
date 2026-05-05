const path = require('path');
const fse = require('fs-extra');
const gp = require('./src/get-platform');
const AppRootDir = require('app-root-dir');
require('dotenv').config()

module.exports = {
  packagerConfig: {
    appBundleId: 'dev.hmiller.port',
    name: 'port',
    executableName: 'port',
    darwinDarkModeSupport: 'true',
    icon: "icons/urbit-logo",
    protocols: [
      {
        name: "Urbit Links",
        protocol: "web+urbitgraph",
        schemes: ["web+urbitgraph"]
      }
    ],
    extendInfo: {
      NSMicrophoneUsageDescription: "We need access to your microphone for Urbit apps",
      NSCameraUsageDescription: "We need access to your camera for Urbit apps"
    },
    // Code signing/notarization opt-in via env vars so contributors without
    // an Apple Developer identity can still build a runnable (unsigned) app.
    ...(process.env.APPLE_SIGNING_IDENTITY ? {
      osxSign: {
        identity: process.env.APPLE_SIGNING_IDENTITY,
        "entitlements": "entitlements.plist",
        "entitlements-inherit": "entitlements.plist",
        'hardened-runtime': true,
        'gatekeeper-assess': false,
        'signature-flags': 'library',
      },
    } : {}),
    ...(process.env.APPLE_ID && process.env.APPLE_ID_PASSWORD && process.env.APPLE_TEAM_ID ? {
      osxNotarize: {
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        teamId: process.env.APPLE_TEAM_ID,
      },
    } : {}),
    win32metadata: {
      CompanyName: 'Urbit Foundation'
    }
  },
  hooks: {
    packageAfterCopy: async (forgeConfig, buildPath, electronVersion, platform) => {
      const os = gp.getPlatform(platform)
      const srcDir = path.join(AppRootDir.get(), 'resources', os);

      // buildPath points to the app's source directory inside the packaged output.
      // For macOS: .../port.app/Contents/Resources/app/
      // For Linux/Windows: .../resources/app/
      // We need to go up to the resources dir and place binaries there.
      const destDir = path.resolve(buildPath, '..', os);

      console.log(`Vere copy: platform=${os}, buildPath=${buildPath}, destDir=${destDir}`);

      if (fse.existsSync(srcDir)) {
        fse.copySync(srcDir, destDir, {
          filter: (src) => !src.includes('.gitignore')
        });
        console.log(`Copied Vere binaries: ${os} -> ${destDir}`);
      } else {
        console.warn(`No Vere binaries found for ${os} at ${srcDir} — skipping`);
      }

      // The webpack plugin marks native deps as externals (so their .node
      // binaries survive bundling) but does not copy them into the packaged
      // app. Copy them and their transitive deps from the source node_modules
      // into resources/app/node_modules.
      const nativeDeps = ['node-pty', 'nedb', 'nedb-async', 'node-ipc'];
      const srcNodeModules = path.join(AppRootDir.get(), 'node_modules');
      const destNodeModules = path.join(buildPath, 'node_modules');

      const copied = new Set();
      const copyDep = (name) => {
        if (copied.has(name)) return;
        const src = path.join(srcNodeModules, name);
        if (!fse.existsSync(src)) {
          console.warn(`Native dep not found in node_modules: ${name}`);
          return;
        }
        copied.add(name);
        fse.copySync(src, path.join(destNodeModules, name), { dereference: true });

        const pkgPath = path.join(src, 'package.json');
        if (fse.existsSync(pkgPath)) {
          const pkg = fse.readJsonSync(pkgPath);
          for (const dep of Object.keys(pkg.dependencies || {})) {
            copyDep(dep);
          }
        }
      };
      nativeDeps.forEach(copyDep);
      console.log(`Copied native deps to ${destNodeModules}: ${[...copied].join(', ')}`);
    },
    postMake: (forgeConfig, makeResults) => {
      if (process.env.GITHUB_WORKFLOW === 'Publish MacOS — arm64') {
          let updatedResults = []
          for (let makeResult of makeResults) {
            let artifacts = makeResult.artifacts
            let oldPath = artifacts.find(p => p.includes('.dmg'))
            if (oldPath) {
              let newPath = path.join(path.dirname(oldPath), 'Port-arm64.dmg')
              fse.renameSync(oldPath, newPath)
              makeResult.artifacts = artifacts.filter(p => !p.includes('.dmg'))
              makeResult.artifacts.push(newPath)
            }

            updatedResults.push(makeResult)
          }

          return updatedResults
      }
    }
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        setupExe: "PortSetup.exe",
        setupIcon: "icons/urbit-logo.ico"
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: "Port",
        icon: "icons/urbit-logo.icns"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: [
        "darwin",
        "linux",
        "win32"
      ]
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        mimeType: ["x-scheme-handler/web+urbitgraph"],
        options: {
          icon: "icons/urbit-logo.png",
          depends: [
            "libx11-xcb1"
          ]
        }
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          icon: "icons/urbit-logo.png"
        }
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'L2301',
          name: 'port-redux'
        },
        draft: true
      }
    }
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        mainConfig: "./src/main/webpack.main.config.js",
        renderer: {
          config: "./src/renderer/webpack.renderer.config.js",
          nodeIntegration: true,
          entryPoints: [
            {
              name: "main_window",
              html: "./src/renderer/index.html",
              js: "./src/renderer/renderer.tsx",
              preload: {
                js: "./src/renderer/client/preload.ts"
              }
            },
            {
              name: "terminal",
              html: "./src/renderer/terminal/index.html",
              js: "./src/renderer/terminal/index.tsx",
              preload: {
                js: "./src/renderer/client/preload.ts"
              }
            },
            {
              html: "./src/background/server/server.html",
              js: "./src/background/main.ts",
              name: "background_window"
            },
            {
              html: "./src/renderer/prompt/index.html",
              js: "./src/renderer/prompt/index.ts",
              name: "prompt"
            },
            {
              html: "./src/background/server/server.html",
              js: "./src/renderer/landscape-preload.ts",
              name: "landscape",
              preload: {
                js: "./src/renderer/landscape-preload.ts"
              }
            }
          ]
        }
      }
    }
  ]
}
