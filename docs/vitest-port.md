# Vite + Vitest Migration Guide

**Project**: Illthorn Electron Application  
**Target**: Migrate from Electron Forge Webpack to Vite + Vitest  
**Created**: July 27, 2025

---

## 🎯 Migration Overview

This guide covers the complete migration from Electron Forge's Webpack plugin to the Vite plugin, plus transitioning from AVA to Vitest for testing. The migration will provide **10-100x faster development builds** through Vite's lightning-fast HMR and modern bundling approach.

### Benefits of Migration
- ⚡ **Dramatically faster development builds** (HMR in milliseconds vs seconds)
- 🛠️ **Native TypeScript support** without transpilation overhead
- 🧪 **Modern testing framework** with zero configuration
- 📦 **Better tree-shaking** and production optimizations
- 🔧 **Superior developer experience** with instant feedback

### Migration Complexity
**Level**: **Medium-High**  
**Risk**: **Moderate** (experimental Vite plugin status)  
**Effort**: Significant configuration changes across 5+ files

---

## ⚠️ Critical Warnings & Considerations

### Experimental Status Alert
- **Electron Forge Vite plugin is experimental** as of v7.5.0
- Future minor releases may contain breaking changes
- Recommended approach: **feature branch with comprehensive testing**

### Dependencies That Will Change
- **Remove**: 8 webpack-related packages (~15MB node_modules reduction)
- **Add**: 2 Vite packages
- **Migrate**: All build configurations and test files

### Compatibility Requirements
- **Node.js**: 22.11.0 ✅ (already current)
- **TypeScript**: 5.8.3 ✅ (already current) 
- **Electron Forge**: 7.8.1 ✅ (already current)

---

## 📋 Phase 1: Vite Build System Migration

### 1.1 Install Vite Dependencies

```bash
# Install Vite plugin
yarn add --dev @electron-forge/plugin-vite

# Optional: Add Vite directly for better IDE support
yarn add --dev vite
```

### 1.2 Create Vite Configuration Files

#### **File 1: `vite.main.config.ts`** (Main Process)
```typescript
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  build: {
    ssr: true,
    sourcemap: true,
    outDir: '.vite/build',
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-squirrel-startup',
        'electron-store',
        // Add other Node.js built-ins and electron-specific modules
        ...Object.keys(require('./package.json').dependencies || {}),
      ],
    },
  },
});
```

#### **File 2: `vite.preload.config.ts`** (Preload Script)
```typescript
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    ssr: true,
    sourcemap: true,
    outDir: '.vite/build',
    lib: {
      entry: 'src/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron'],
    },
  },
});
```

#### **File 3: `vite.renderer.config.ts`** (Renderer Process)
```typescript
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  root: '.',
  build: {
    outDir: '.vite/renderer/main_window',
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Enable absolute imports from src
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add any global SCSS variables or mixins here
        additionalData: ``, // Can add global SCSS imports if needed
      },
    },
  },
  server: {
    port: 3001, // Match the webpack dev server port
  },
});
```

### 1.3 Update Forge Configuration

**File**: `forge.config.ts`

```typescript
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';

const deb = new MakerDeb(
  { options: {icon: "./icons/app-icon.png", productName: "illthorn"} }
);
const rpm = new MakerRpm(
  { options: {icon: "./icons/app-icon.png"} }
);
const squirrel = new MakerSquirrel(
  { iconUrl: "https://raw.githubusercontent.com/elanthia-online/illthorn/electron-22/icons/app-icon.ico"
  , setupIcon: "./icons/app-icon.ico"
  }
);
const zip = new MakerZIP({}, ['darwin']);

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [deb, rpm, squirrel, zip],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
```

### 1.4 Update Main Process Entry Points

**File**: `src/main.ts`

**Before (Webpack)**:
```typescript
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// ... later in createWindow()
webPreferences: {
  preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
  // ...
},

mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
```

**After (Vite)**:
```typescript
// Remove webpack-specific declarations

// ... in createWindow()
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  // ...
},

// In development, load from vite dev server
if (process.env.NODE_ENV === 'development') {
  mainWindow.loadURL('http://localhost:3001');
} else {
  // In production, load from built files
  mainWindow.loadFile(path.join(__dirname, '../renderer/main_window/index.html'));
}
```

### 1.5 Update Package.json Main Entry

**File**: `package.json`

**Before**:
```json
{
  "main": ".webpack/main"
}
```

**After**:
```json
{
  "main": ".vite/build/main.js"
}
```

### 1.6 Handle Asset Migration

The current webpack setup copies the `icons` directory. With Vite, we have several options:

#### **Option A: Public Directory (Recommended)**
1. Create `public/` directory in project root
2. Move `icons/` to `public/icons/`
3. Update references to use `/icons/...` (Vite serves public assets at root)

#### **Option B: Static Asset Imports**
Import icons directly in TypeScript files where needed:
```typescript
import appIcon from '../icons/app-icon.png';
```

#### **Option C: Manual Copy in Vite Config**
Add to `vite.main.config.ts`:
```typescript
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  // ... other config
  plugins: [
    {
      name: 'copy-icons',
      generateBundle() {
        mkdirSync('.vite/build/icons', { recursive: true });
        copyFileSync('icons/app-icon.png', '.vite/build/icons/app-icon.png');
        copyFileSync('icons/app-icon.ico', '.vite/build/icons/app-icon.ico');
      }
    }
  ]
});
```

### 1.7 Update TypeScript Configuration

**File**: `tsconfig.json`

**Current**:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "moduleResolution": "node",
    // ...
  }
}
```

**Updated for Vite**:
```json
{
  "compilerOptions": {
    "target": "ESNext", 
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "isolatedModules": true,
    // ... keep other existing options
  }
}
```

---

## 📋 Phase 2: Vitest Testing Migration

### 2.1 Install Vitest and Remove AVA

```bash
# Install Vitest
yarn add --dev vitest @vitest/ui

# Remove AVA dependencies
yarn remove ava @ava/typescript tsx
```

### 2.2 Create Vitest Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.vite', 'dist'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

### 2.3 Migrate Test Files

**Current**: `test/command-history.spec.ts`
```typescript
import test from 'ava'
import {CommandHistory} from "../src/frontend/session/command-history"

test("CommandHistory#last()", t => {
  const history = new CommandHistory()
  const commands = ["climb tower", "exp", "info"]
  commands.forEach(cmd =>history.add(cmd))
  t.truthy(history.back() == "exp")
  t.truthy(history.back() == "climb tower")
  t.truthy(history.back() == "info")
})
```

**Migrated to Vitest**:
```typescript
import { test, expect, describe } from 'vitest'
import { CommandHistory } from "../src/frontend/session/command-history"

describe('CommandHistory', () => {
  test('back() returns commands in reverse order', () => {
    const history = new CommandHistory()
    const commands = ["climb tower", "exp", "info"]
    commands.forEach(cmd => history.add(cmd))
    
    expect(history.back()).toBe("exp")
    expect(history.back()).toBe("climb tower")
    expect(history.back()).toBe("info")
  })
})
```

### 2.4 Update Package.json Scripts

**File**: `package.json`

**Before**:
```json
{
  "scripts": {
    "test": "yarn ava"
  },
  "ava": {
    "typescript": {
      "rewritePaths": {
        "src/": "dist/"
      },
      "compile": false
    },
    "nodeArguments": [
      "--import=tsx"
    ]
  }
}
```

**After**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Remove the entire `"ava"` configuration block.

---

## 📋 Phase 3: Configuration Cleanup

### 3.1 Remove Webpack Files

After successful migration and testing, **delete these files**:
1. `webpack.main.config.ts`
2. `webpack.renderer.config.ts`
3. `webpack.rules.ts`
4. `webpack.plugins.ts`

### 3.2 Remove Webpack Dependencies

```bash
# Remove webpack and loaders
yarn remove webpack @vercel/webpack-asset-relocator-loader
yarn remove ts-loader style-loader css-loader sass-loader copy-webpack-plugin
yarn remove node-loader fork-ts-checker-webpack-plugin

# Note: Keep sass itself as Vite can use it directly
```

### 3.3 Verify Development Environment

After migration, these should all work:
```bash
yarn start      # Development with HMR
yarn make       # Production build
yarn test       # Vitest test runner
yarn test:ui    # Vitest UI mode
```

---

## 🧪 Testing & Validation Protocol

### Pre-Migration Checklist
- [ ] **Backup current working state** (commit all changes)
- [ ] **Create feature branch**: `git checkout -b feature/vite-migration`
- [ ] **Verify current build works**: `yarn start && yarn make`
- [ ] **Run current tests**: `yarn test`

### Migration Validation Checklist

#### Core Functionality Tests
- [ ] **Development mode**: `yarn start` launches without errors
- [ ] **Hot Module Replacement**: Changes in renderer code update instantly
- [ ] **Session connections**: TCP socket connections to Lich work correctly
- [ ] **UI components**: All themes, feeds, prompts render correctly
- [ ] **IPC communication**: Main ↔ Renderer communication works
- [ ] **File operations**: Settings load/save correctly
- [ ] **Native modules**: WebSocket and other native deps work

#### Build System Tests  
- [ ] **Production build**: `yarn make` completes successfully
- [ ] **Package generation**: All target platforms build (deb, rpm, zip, squirrel)
- [ ] **Bundle sizes**: Production bundles are reasonable size
- [ ] **Source maps**: Development debugging works correctly

#### Testing Framework Tests
- [ ] **Test execution**: `yarn test` runs all tests
- [ ] **Test results**: All existing tests pass
- [ ] **Coverage reporting**: `yarn test:coverage` works
- [ ] **Watch mode**: Tests re-run on file changes
- [ ] **UI mode**: `yarn test:ui` provides visual test interface

### Performance Validation
- [ ] **Development build time**: Measure initial build and HMR speeds
- [ ] **Production build time**: Compare total package creation time
- [ ] **Bundle analysis**: Verify tree-shaking is working
- [ ] **Memory usage**: Check development server memory consumption

---

## 🚨 Troubleshooting Guide

### Common Vite Migration Issues

#### Issue: "Cannot resolve module" errors
**Cause**: Vite handles module resolution differently than webpack  
**Solution**: Update import paths or add to `resolve.alias` in vite config

#### Issue: Native modules fail to load
**Cause**: Electron needs special handling for native dependencies  
**Solution**: Add to `external` array in rollup options:
```typescript
rollupOptions: {
  external: ['electron', 'ws', 'keyboardjs', ...]
}
```

#### Issue: Assets not found in production
**Cause**: Asset paths changed from webpack to vite  
**Solution**: Use public directory or explicit asset imports

#### Issue: CSS/SCSS not loading
**Cause**: Vite CSS handling differs from webpack loaders  
**Solution**: Verify CSS preprocessor options in vite.renderer.config.ts

### Common Vitest Migration Issues

#### Issue: Import errors in tests
**Cause**: Module resolution differences  
**Solution**: Update `vitest.config.ts` resolve aliases to match main config

#### Issue: "process is not defined" in tests
**Cause**: Browser-like environment vs Node.js  
**Solution**: Set `environment: 'node'` in vitest config

#### Issue: Mocking doesn't work
**Cause**: Different mocking API than AVA  
**Solution**: Use Vitest's `vi.mock()` instead of AVA patterns

### Performance Issues

#### Issue: Slow development startup
**Cause**: Too many dependencies being processed  
**Solution**: Add more items to `external` array in vite configs

#### Issue: Large production bundles
**Cause**: Poor tree-shaking or unnecessary inclusions  
**Solution**: Use `rollup-plugin-visualizer` to analyze bundle

---

## 🔄 Rollback Procedure

If migration fails or causes issues:

### Quick Rollback
1. **Switch back to branch**: `git checkout master`
2. **Verify functionality**: `yarn start` and `yarn test`
3. **Document issues**: Create issue with migration problems

### Partial Rollback (Keep Vitest, Revert Vite)
1. **Keep test changes**: Cherry-pick Vitest migration commits
2. **Revert build system**: Restore webpack configurations
3. **Update package.json**: Restore webpack main entry point

### Migration Recovery
1. **Fix specific issues**: Address problems found during testing
2. **Re-test thoroughly**: Go through full validation checklist again
3. **Document solutions**: Update this guide with fixes

---

## 📈 Expected Outcomes

### Performance Improvements
- **Development builds**: 10-100x faster (seconds → milliseconds)
- **Hot Module Replacement**: Near-instant updates
- **Test execution**: Faster test runs with better reporting
- **Bundle optimization**: Better tree-shaking in production

### Developer Experience Enhancements
- **Zero-config TypeScript**: No transpilation step needed
- **Better error reporting**: More descriptive build errors
- **Modern tooling**: Access to Vite ecosystem plugins
- **Superior debugging**: Better source map support

### Maintenance Benefits
- **Simplified configuration**: Fewer config files to maintain
- **Modern ecosystem**: Active development and community support
- **Better documentation**: Vite docs are comprehensive and current
- **Future-proof**: Aligned with modern frontend tooling trends

---

## 📚 Additional Resources

### Official Documentation
- **Electron Forge Vite Plugin**: https://www.electronforge.io/config/plugins/vite
- **Vite Configuration**: https://vitejs.dev/config/
- **Vitest Guide**: https://vitest.dev/guide/

### Example Projects  
- **electron-vite**: https://github.com/electron-vite/electron-vite
- **Vite Electron Template**: Use `npm init electron-app@latest -- --template=vite-typescript`

### Community Resources
- **Electron Discord**: #electron-forge channel
- **Vite Discord**: #help channel  
- **GitHub Discussions**: Both projects have active discussion forums

---

**Last Updated**: July 27, 2025  
**Status**: Ready for implementation  
**Estimated Effort**: Medium-High complexity migration requiring careful testing