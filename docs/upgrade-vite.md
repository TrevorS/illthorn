# Vite & Vitest Upgrade Analysis

## Executive Summary

This document analyzes the benefits, challenges, and migration paths for upgrading Illthorn from Vite 6.3.5/Vitest 2.1.9 to the latest Vite 7.0.6/Vitest 3.2.2. The primary blocker is Electron Forge's Vite plugin only supporting Vite ^5.0.12, requiring a migration to electron-vite for access to latest versions.

**Recommendation**: Migrate to electron-vite 4.0.0 for immediate access to latest tooling with significant performance and DX improvements.

**Timeline**: 2-3 days migration + testing  
**Risk Level**: Medium (well-supported migration path)  
**Effort**: Configuration changes, testing, validation

## Current State Analysis

### Current Versions
- **Vite**: ^6.3.5 (released ~6 months ago)
- **Vitest**: 2.1.9 (released ~4 months ago)  
- **Node.js**: 22.11.0 (meets Vite 7 requirements)
- **Electron Forge**: 7.8.1 with Vite plugin 7.8.1

### Constraints
- Electron Forge Vite plugin marked "experimental" with breaking changes
- Plugin only supports Vite ^5.0.12 (significantly behind)
- No clear timeline for Vite 7 support in Electron Forge

### Dependencies Impact
Current setup uses:
- `@electron-forge/plugin-vite: ^7.8.1`
- Complex build pipeline with main/preload/renderer configs
- SCSS preprocessing, TypeScript support
- Vitest with JSDOM for component testing

## Latest Version Benefits

### Vite 7.0.6 Improvements
- **Performance**: Reduced client-side reload debounce, optimized module scanning
- **Modern Node.js**: ESM-only distribution with better `require(esm)` support  
- **Enhanced DX**: Improved TypeScript integration, better CSS/asset resolution
- **API Enhancements**: New `import.meta.glob()` base option, enhanced SSR handling
- **Build Target**: Updated to "baseline-widely-available" for better browser support

### Vitest 3.2.2 Improvements
- **New Testing APIs**: `vi.mockObject()` for easy object mocking
- **Performance**: Enhanced module execution tracking with `totalTime`/`selfTime` metrics
- **Browser Testing**: Custom locators API, screenshot saving capabilities
- **DX Improvements**: Annotation API, per-file/worker fixtures, better error reporting
- **Coverage**: V8 experimental AST-aware remapping, flexible test sequencing

## What Build Tools Actually Do For Us

Before diving into migration options, it's important to understand what Electron Forge and electron-vite actually provide.

### The Multi-Process Problem

Electron apps are complex because you're building **3 different applications**:

1. **Main Process** (`src/main.ts` → `.vite/build/main.js`)  
   - Node.js app that controls windows and app lifecycle
   - Needs Node.js environment, externalized dependencies
   - Outputs CommonJS for Electron compatibility

2. **Preload Script** (`src/preload.ts` → `.vite/build/preload.js`)  
   - Security bridge between main and renderer processes
   - Minimal Node.js context, just context bridge setup
   - Critical for secure IPC communication

3. **Renderer Process** (`src/frontend/` → `.vite/renderer/main_window/`)  
   - Web app that runs inside Electron window
   - Browser environment, can bundle dependencies
   - Modern web technologies (ES modules, CSS, etc.)

### What These Tools Provide

**The Real Value:**
- **Pre-configured builds** - They know Electron's weird requirements
- **Coordinated compilation** - Run all 3 builds in correct order
- **Development orchestration** - Hot reload that works with Electron's security model
- **Packaging integration** - Turn code into distributable apps (.app/.exe/.deb)

**Without these tools**, you'd need to:
- Set up 3 separate Vite configs manually
- Orchestrate build order and dependencies
- Handle development server coordination
- Create packaging scripts from scratch
- Deal with Electron's path and security quirks

**Current Architecture Analysis:**
Looking at your `vite.main.config.ts`, the Forge plugin handles:
- SSR-style builds for Node.js contexts
- External dependency management (Electron, your npm deps)
- Proper output formats (CJS for main, different for renderer)
- Development vs production path resolution

This coordination is genuinely complex - these tools exist because Electron development has real architectural challenges.

## Migration Options

### Option 1: electron-vite Migration (Recommended)

**Overview**: Switch from Electron Forge to electron-vite 4.0.0

**Pros**:
- ✅ Immediate access to Vite 7.0.6 and Vitest 3.2.2
- ✅ Often gets experimental features before Electron Forge
- ✅ Direct Vite integration without plugin wrapper
- ✅ Active development and Vite 7 support

**Cons**:  
- ❌ Migration effort for build configuration
- ❌ Different packaging approach (may need electron-builder)
- ❌ Less integrated ecosystem than Electron Forge

**Effort**: Medium (2-3 days)

### Option 2: Wait for Electron Forge

**Overview**: Wait for Electron Forge Vite plugin to support Vite 7

**Pros**:
- ✅ No migration effort
- ✅ Familiar tooling and workflow
- ✅ Integrated packaging/distribution

**Cons**:
- ❌ Unknown timeline (could be months)
- ❌ Missing performance improvements  
- ❌ No access to latest testing features
- ❌ Plugin marked "experimental" with breaking changes

**Effort**: None, but indefinite wait

### Option 3: Hybrid Approach

**Overview**: Use electron-vite for development, Electron Forge for packaging

**Pros**:
- ✅ Latest tooling for development
- ✅ Familiar packaging process
- ✅ Best of both worlds

**Cons**:
- ❌ Complex setup and maintenance
- ❌ Potential configuration conflicts
- ❌ Two build systems to maintain

**Effort**: High (3-4 days setup + ongoing maintenance)

### Option 4: Implement Vite 7 Support in Electron Forge Plugin

**Overview**: Contribute to or fork the Electron Forge Vite plugin to add Vite 7 support

**Current Plugin State:**
- **Status**: Experimental with breaking changes expected
- **Vite support**: ^5.0.12 (significantly behind latest)
- **Vitest support**: ^3.1.3 (already newer than our production version)
- **Architecture**: TypeScript plugin coordinating main/preload/renderer builds

**Required Implementation Work:**

1. **Package Dependencies Update**
   ```json
   {
     "devDependencies": {
       "vite": "^7.0.6",  // from ^5.0.12
       "vitest": "^3.2.2"  // already ^3.1.3
     },
     "engines": {
       "node": ">=20.19.0"  // from >=16.4.0
     }
   }
   ```

2. **Core API Migration**
   - `vite.build()` - Review configuration options for Vite 7 changes
   - `vite.createServer()` - Check server creation API updates
   - `ViteDevServer` interface - Update `resolvedUrls`/`httpServer` property access
   - Rollup watcher types - Verify type compatibility with new versions

3. **Breaking Changes to Address**
   - **Sass API**: Ensure using modern API (likely already compliant)
   - **Browser target**: Update default to 'baseline-widely-available'
   - **ESM distribution**: Handle Vite 7's ESM-only approach
   - **Hook interfaces**: Update any `transformIndexHtml` patterns

4. **Implementation Areas**
   - `VitePlugin.ts`: Core build orchestration logic
   - Build methods: main/preload/renderer process builders
   - Dev server management: URL resolution and server lifecycle
   - Configuration handling: Vite config merging and validation

**Known Issues from Research:**
- Plugin has history of breaking changes (v7.3.0 broke Vite 5 upgrades)
- ESM support issues - code still references "Electron can only support cjs"
- Build packaging problems on Windows with incomplete asar files
- Community forks exist addressing some limitations

**Pros**:
- ✅ Contribute to the broader Electron community
- ✅ Keep familiar Electron Forge ecosystem
- ✅ Maintain integrated packaging/distribution
- ✅ Fix the blocker for everyone, not just us

**Cons**:
- ❌ High complexity - need deep Vite and Electron Forge knowledge
- ❌ Uncertain timeline - could take weeks to implement and test
- ❌ Community coordination - need buy-in from Forge maintainers
- ❌ Ongoing maintenance burden if forking

**Effort**: High (1-2 weeks for experienced contributor)
**Risk**: Medium-High (experimental plugin, complex integration)

## Detailed Migration Steps (Option 1: electron-vite)

### Phase 1: Preparation

1. **Create migration branch**
   ```bash
   git checkout -b feature/migrate-electron-vite
   ```

2. **Backup current configuration files**
   ```bash
   cp forge.config.ts forge.config.ts.backup
   cp package.json package.json.backup
   ```

3. **Research electron-vite structure**
   - Review [electron-vite documentation](https://electron-vite.org/)
   - Study configuration patterns
   - Understand packaging differences

### Phase 2: Install and Configure electron-vite

1. **Remove Electron Forge Vite plugin**
   ```bash
   yarn remove @electron-forge/cli @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/plugin-vite
   ```

2. **Install electron-vite and dependencies**
   ```bash
   yarn add -D electron-vite@^4.0.0 electron-builder
   yarn add -D vite@^7.0.6 vitest@^3.2.2
   ```

3. **Create electron.vite.config.ts**
   ```typescript
   import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
   import { resolve } from 'path'

   export default defineConfig({
     main: {
       plugins: [externalizeDepsPlugin()],
       build: {
         rollupOptions: {
           input: {
             index: resolve(__dirname, 'src/main.ts')
           }
         }
       }
     },
     preload: {
       plugins: [externalizeDepsPlugin()],
       build: {
         rollupOptions: {
           input: {
             index: resolve(__dirname, 'src/preload.ts')
           }
         }
       }
     },
     renderer: {
       root: resolve(__dirname, 'src/frontend'),
       build: {
         rollupOptions: {
           input: {
             index: resolve(__dirname, 'src/frontend/index.html')
           }
         }
       },
       resolve: {
         alias: {
           '@': resolve(__dirname, 'src')
         }
       },
       define: {
         'process.env.SHOELACE_BASE_PATH': JSON.stringify('/node_modules/@shoelace-style/shoelace/dist/')
       },
       css: {
         preprocessorOptions: {
           scss: {
             additionalData: ``
           }
         }
       },
       esbuild: {
         target: 'ESNext',
         tsconfigRaw: {
           compilerOptions: {
             experimentalDecorators: true,
             useDefineForClassFields: false
           }
         }
       }
     }
   })
   ```

4. **Update package.json scripts**
   ```json
   {
     "scripts": {
       "start": "electron-vite dev",
       "dev": "electron-vite dev",
       "build": "electron-vite build",
       "preview": "electron-vite preview",
       "package": "electron-builder",
       "make": "electron-vite build && electron-builder",
       "lint": "biome check --write .",
       "format": "biome format --write .",
       "typecheck": "electron-vite build --mode production",
       "test": "vitest run --reporter=verbose --bail=1",
       "test:watch": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

5. **Create electron-builder configuration**
   
   Add to package.json:
   ```json
   {
     "build": {
       "appId": "com.elanthia.illthorn",
       "productName": "illthorn", 
       "directories": {
         "output": "dist"
       },
       "files": [
         "out/**/*",
         "node_modules/**/*"
       ],
       "mac": {
         "category": "public.app-category.games"
       },
       "win": {
         "target": "nsis"
       },
       "linux": {
         "target": "AppImage"
       }
     }
   }
   ```

### Phase 3: Update Configurations

1. **Update Vitest config for v3**
   ```typescript
   import { defineConfig } from 'vitest/config'
   import path from 'path'

   export default defineConfig({
     test: {
       globals: true,
       environment: 'jsdom',
       include: ['test/**/*.{test,spec}.ts'],
       exclude: ['node_modules', 'out', 'dist'],
       silent: false,
       hideSkippedTests: true,
       // New Vitest 3 features
       sequence: {
         shuffle: false,
         concurrent: true
       },
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
         exclude: ['node_modules/', 'test/', 'out/', 'dist/']
       },
       onConsoleLog(log, type) {
         if (log.includes('Lit is in dev mode')) {
           return false
         }
         return true
       }
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, 'src')
       }
     },
     esbuild: {
       target: 'ESNext',
       tsconfigRaw: {
         compilerOptions: {
           experimentalDecorators: true,
           useDefineForClassFields: false
         }
       }
     }
   })
   ```

2. **Create src/frontend/index.html** (if needed)
   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <meta charset="UTF-8">
       <title>Illthorn</title>
       <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
     </head>
     <body>
       <div id="app"></div>
       <script type="module" src="./index.ts"></script>
     </body>
   </html>
   ```

### Phase 4: Handle Breaking Changes

1. **Vite 6 → 7 Breaking Changes**
   - Update Node.js requirement in volta config (already 22.11.0 ✅)
   - Check for any usage of removed APIs
   - Verify Sass integration (modern API already used ✅)
   - Update browser target if needed

2. **Vitest 2 → 3 Breaking Changes**
   - Update any deprecated test APIs
   - Check custom matchers compatibility
   - Verify coverage configuration
   - Update snapshot testing if needed

### Phase 5: Testing and Validation

1. **Development workflow**
   ```bash
   yarn start  # Test hot reload
   yarn test   # Run test suite
   yarn typecheck  # Verify TypeScript
   ```

2. **Build validation**
   ```bash
   yarn build   # Test production build
   yarn package # Test packaging
   ```

3. **Cross-platform testing**
   - Test on macOS, Windows, Linux
   - Verify packaging on each platform
   - Check distribution artifacts

4. **Feature validation**
   - Test all Lit components
   - Verify theme switching
   - Test session management
   - Validate parser functionality

## Configuration Mapping

### Electron Forge → electron-vite

| Forge Config | electron-vite Equivalent |
|-------------|-------------------------|
| `forge.config.ts` | `electron.vite.config.ts` |
| `vite.main.config.ts` | `main` section in config |
| `vite.preload.config.ts` | `preload` section in config |
| `vite.renderer.config.ts` | `renderer` section in config |
| Makers (deb, rpm, etc.) | electron-builder config |
| Package scripts | Updated scripts in package.json |

### Key Differences

- **Build output**: `.vite/` → `out/` directory
- **Packaging**: Forge makers → electron-builder targets
- **Dev server**: Forge dev server → electron-vite dev
- **Configuration**: Separate files → unified config

## Breaking Changes Checklist

### Vite 7 Breaking Changes
- [ ] Node.js 20.19+ requirement (✅ already met)
- [ ] ESM-only distribution (check import statements)
- [ ] Browser target "baseline-widely-available" 
- [ ] Removed experimental SSR transform options
- [ ] Sass legacy API removed (✅ using modern API)

### Vitest 3 Breaking Changes
- [ ] Updated reporter API (check custom reporters)
- [ ] Changed workspace configuration format
- [ ] New test filtering options
- [ ] Coverage provider updates

### electron-vite Specific
- [ ] Build directory change (`.vite/` → `out/`)
- [ ] Main process externalization requirements
- [ ] Packaging configuration migration
- [ ] Development server differences

## Rollback Plan

If migration encounters issues:

1. **Immediate rollback**
   ```bash
   git checkout feature/migrate-electron-vite -- package.json
   yarn install
   ```

2. **Restore configurations**
   ```bash
   cp forge.config.ts.backup forge.config.ts
   cp package.json.backup package.json
   ```

3. **Reinstall Electron Forge**
   ```bash
   yarn add -D @electron-forge/cli @electron-forge/plugin-vite
   ```

## Timeline and Resources

### Estimated Timeline
- **Day 1**: Setup, configuration, initial migration
- **Day 2**: Fix breaking changes, test basic functionality
- **Day 3**: Full testing, packaging validation, documentation

### Resource Requirements
- **Developer time**: 2-3 days focused work
- **Testing**: Multi-platform validation
- **Documentation**: Update build instructions

### Risk Mitigation
- Feature branch development
- Comprehensive backup plan
- Incremental testing approach
- Rollback procedures documented

## Decision Matrix

| Factor | electron-vite | Wait for Forge | Hybrid | Implement Vite 7 |
|--------|---------------|----------------|---------|-------------------|
| **Time to Latest Vite** | Immediate | Unknown | Immediate | 1-2 weeks |
| **Migration Effort** | Medium | None | High | High |
| **Maintenance Burden** | Low | Low | High | Medium |
| **Feature Access** | Full | Limited | Full | Full |
| **Risk Level** | Medium | Low | High | Medium-High |
| **Long-term Viability** | High | Medium | Low | High |
| **Community Benefit** | None | None | None | High |
| **Technical Learning** | Low | None | Medium | High |

## Recommendations

### Primary Recommendation: electron-vite Migration

**Why**: 
- Immediate access to Vite 7 performance improvements
- Better long-term positioning for latest tooling
- electron-vite often leads Electron Forge in features
- Clear migration path with good documentation

**When**: Start migration after current feature work is complete

**Success Criteria**:
- All current functionality preserved
- Build times improved
- Test suite passes completely
- Cross-platform packaging works

### Secondary Recommendation: Implement Vite 7 Support

**Consider this option if:**
- You want to contribute to the Electron community
- Technical learning and exploration are valued
- Timeline flexibility allows for 1-2 week investment
- You're comfortable with experimental/beta software development

**Implementation Strategy:**
1. **Fork approach**: Start with a fork to prototype changes
2. **Community coordination**: Engage with Electron Forge maintainers early
3. **Incremental development**: Focus on core Vite 7 compatibility first
4. **Testing emphasis**: Comprehensive testing across platforms and use cases

### Alternative: Evaluate in 3 months

If immediate migration isn't feasible, re-evaluate in Q2 2025:
- Check Electron Forge Vite 7 support status  
- Assess new features released in Vite/Vitest
- Consider technical debt of staying behind

## Conclusion

The benefits of upgrading to Vite 7 and Vitest 3 are significant - improved performance, better developer experience, and access to modern tooling. While Electron Forge's Vite plugin lags behind, electron-vite provides a clear migration path with immediate benefits.

The 2-3 day migration investment yields:
- Better build performance and HMR
- Enhanced testing capabilities  
- Modern Node.js and ESM support
- Future-proofed tooling choices

## Strategic Considerations

### For Immediate Needs: electron-vite Migration
Choose this if you need Vite 7 features now and want a proven migration path with minimal risk.

### For Community Impact: Implement Forge Plugin Support  
Choose this if you value contributing to the ecosystem and have bandwidth for a more complex technical challenge.

### For Conservative Approach: Wait and Evaluate
Choose this if current tooling meets your needs and you prefer to let others solve compatibility issues first.

**Final Recommendation**: Proceed with electron-vite migration for immediate access to latest Vite/Vitest features and improved development experience. Consider the Forge plugin implementation as a future community contribution if interested in deeper Electron build tooling development.