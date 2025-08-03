// ABOUTME: Core GameStateStore implementation for centralized state management
// ABOUTME: Orchestrates all game state including character, environment, UI, and session data

import type { GameTag } from "../../parser/tag";
import type {
  GameState,
  StateMetadata,
  GameStateConfig,
  StateChangeEvent,
  StateChangeType,
  StateChangeListener
} from "../types/game-state";
import type { CharacterState, VitalData, SpellEffectData, ProcessedInjury } from "../types/character";
import type { EnvironmentState, RoomState, DirectionData } from "../types/environment";
import type { StreamState } from "../types/streams";
import type { UIState } from "../types/ui-state";
import type { SessionState } from "../types/session";
import { GameLogStoreImpl, type GameLogEventInput, type GameLogEventListener } from "./game-log-store";

/**
 * Core implementation of the centralized game state store
 * Manages all game state with immutable updates and event-driven architecture
 */
export class GameStateStore {
  // Core state - immutable once set
  private _state: GameState;
  
  // Game log store for event stream
  private _gameLog: GameLogStoreImpl;
  
  // Listeners and subscriptions
  private _listeners: Set<StateChangeListener> = new Set();
  private _gameLogUnsubscribe?: () => void;
  
  // Configuration
  private readonly _config: GameStateConfig;
  
  // Performance tracking
  private _updateCount: number = 0;
  private _lastUpdateTime: Date = new Date();

  constructor(config?: Partial<GameStateConfig>) {
    this._config = {
      enableDebug: config?.enableDebug ?? false,
      enablePersistence: config?.enablePersistence ?? false,
      enableValidation: config?.enableValidation ?? true,
      memoryManagement: {
        autoCleanup: config?.memoryManagement?.autoCleanup ?? true,
        warningThresholdMB: config?.memoryManagement?.warningThresholdMB ?? 100,
        forceCleanupThresholdMB: config?.memoryManagement?.forceCleanupThresholdMB ?? 200
      },
      performance: {
        enableTiming: config?.performance?.enableTiming ?? false,
        metricsIntervalMs: config?.performance?.metricsIntervalMs ?? 5000,
        slowOperationThresholdMs: config?.performance?.slowOperationThresholdMs ?? 50
      }
    };
    
    // Initialize game log store
    this._gameLog = new GameLogStoreImpl({
      maxEvents: 10000,
      maxAgeHours: 24,
      enablePersistence: this._config.enablePersistence
    });
    
    // Subscribe to game log events
    this._gameLogUnsubscribe = this._gameLog.subscribe(this.handleGameLogEvent.bind(this));
    
    // Initialize default state
    this._state = this.createDefaultState();
  }

  /**
   * Get the current immutable state
   */
  get state(): Readonly<GameState> {
    return this._state;
  }

  /**
   * Get the game log store
   */
  get gameLog(): GameLogStoreImpl {
    return this._gameLog;
  }

  /**
   * Process a game event and update state accordingly
   * This is the main entry point for all game data
   */
  processGameEvent(eventInput: GameLogEventInput): void {
    const startTime = this._config.performance.enableTiming ? performance.now() : 0;
    
    try {
      // Append to game log first (immutable record)
      const event = this._gameLog.appendEvent(eventInput);
      
      // Process the event content to update state
      let stateChanged = false;
      
      for (const tag of event.content) {
        if (this.processGameTag(tag)) {
          stateChanged = true;
        }
      }
      
      // Update event metadata if state changed
      if (stateChanged) {
        event.meta.triggeredStateChange = true;
        this.updateMetadata();
      }
      
      // Performance tracking
      if (this._config.performance.enableTiming) {
        const processingTime = performance.now() - startTime;
        if (processingTime > this._config.performance.slowOperationThresholdMs) {
          console.warn(`Slow game event processing: ${processingTime.toFixed(2)}ms`);
        }
      }
      
    } catch (error) {
      console.error('Failed to process game event:', error);
      throw error;
    }
  }

  /**
   * Update character vitals
   */
  updateVital(vitalType: keyof CharacterState['vitals'], vitalData: VitalData): void {
    this.updateState(state => {
      state.character.vitals[vitalType] = {
        ...vitalData,
        lastUpdated: new Date()
      };
    }, `character.vitals.${vitalType}`);
  }

  /**
   * Update character injuries
   */
  updateInjuries(injuries: Array<ProcessedInjury>): void {
    this.updateState(state => {
      state.character.injuries.processed = injuries;
    }, 'character.injuries');
  }

  /**
   * Update active spell effects
   */
  updateEffects(effects: Array<SpellEffectData>): void {
    this.updateState(state => {
      state.character.effects.active = effects;
    }, 'character.effects');
  }

  /**
   * Update room information
   */
  updateRoom(roomData: Partial<RoomState>): void {
    this.updateState(state => {
      Object.assign(state.environment.room, roomData, {
        lastUpdated: new Date()
      });
    }, 'environment.room');
  }

  /**
   * Update compass directions
   */
  updateCompass(directions: Array<DirectionData>): void {
    this.updateState(state => {
      state.environment.compass.directions = directions;
      state.environment.compass.lastUpdated = new Date();
    }, 'environment.compass');
  }

  /**
   * Update UI panel visibility
   */
  updatePanelVisibility(panelType: string, visible: boolean): void {
    this.updateState(state => {
      // Type-safe panel updates would require more specific typing
      // For now, use generic object access
      const panels = state.ui.panels as any;
      if (panels.hud && panelType in panels.hud) {
        panels.hud[panelType] = visible;
      } else if (panels.streams && panelType in panels.streams) {
        panels.streams[panelType] = visible;
      } else if (panels.utility && panelType in panels.utility) {
        panels.utility[panelType] = visible;
      }
    }, 'ui.panels');
  }

  /**
   * Update session connection status
   */
  updateConnectionStatus(status: SessionState['connection']['status']): void {
    this.updateState(state => {
      state.session.connection.status = status;
      if (status === 'connected') {
        state.session.connection.connectedAt = new Date();
      }
      state.session.connection.lastActivity = new Date();
    }, 'session.connection');
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateChangeListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Reset all state to defaults
   */
  reset(): void {
    this._state = this.createDefaultState();
    this._gameLog.clearEvents();
    this.notifyListeners({
      type: 'meta.debug',
      path: 'root',
      newValue: this._state,
      timestamp: new Date()
    });
  }

  /**
   * Dispose of the store and cleanup resources
   */
  dispose(): void {
    this._listeners.clear();
    this._gameLogUnsubscribe?.();
  }

  // Private implementation methods

  /**
   * Process an individual GameTag and update state accordingly
   */
  private processGameTag(tag: GameTag): boolean {
    let stateChanged = false;
    
    switch (tag.name) {
      case 'progressBar':
        stateChanged = this.processProgressBarTag(tag);
        break;
        
      case 'dialogData':
        stateChanged = this.processDialogDataTag(tag);
        break;
        
      case 'compass':
        stateChanged = this.processCompassTag(tag);
        break;
        
      case 'nav':
        stateChanged = this.processNavigationTag(tag);
        break;
        
      case 'room':
        stateChanged = this.processRoomTag(tag);
        break;
        
      case 'streamWindow':
      case 'pushStream':
      case 'popStream':
        stateChanged = this.processStreamTag(tag);
        break;
        
      default:
        // Handle other tags or ignore
        break;
    }
    
    return stateChanged;
  }

  /**
   * Process progressBar tags (vitals)
   */
  private processProgressBarTag(tag: GameTag): boolean {
    const id = tag.attrs.id as string;
    
    if (!id) return false;
    
    // Map known vital IDs
    const vitalMap: Record<string, keyof CharacterState['vitals']> = {
      'health': 'health',
      'mana': 'mana',
      'stamina': 'stamina',
      'spirit': 'spirit',
      'mind': 'mind',
      'stance': 'stance',
      'encumbrance': 'encumbrance'
    };
    
    const vitalType = vitalMap[id];
    if (!vitalType) return false;
    
    const vitalData: VitalData = {
      label: id,
      value: tag.attrs.value as string,
      percent: tag.attrs.value ? Number(tag.attrs.value) : undefined,
      text: tag.attrs.text as string,
      lastUpdated: new Date()
    };
    
    this.updateVital(vitalType, vitalData);
    return true;
  }

  /**
   * Process dialogData tags (injuries, effects, etc.)
   */
  private processDialogDataTag(tag: GameTag): boolean {
    const id = tag.attrs.id as string;
    
    if (!id) return false;
    
    switch (id) {
      case 'Active Spells':
        return this.processActiveSpellsDialog(tag);
        
      case 'injuries':
        return this.processInjuriesDialog(tag);
        
      default:
        return false;
    }
  }

  /**
   * Process Active Spells dialog
   */
  private processActiveSpellsDialog(tag: GameTag): boolean {
    const effects: Array<SpellEffectData> = [];
    
    // Extract spell effects from children
    for (const child of tag.children || []) {
      if (child.name === 'progressBar') {
        const effect: SpellEffectData = {
          id: child.attrs.id as string || `effect_${Date.now()}`,
          text: child.attrs.text as string || '',
          time: child.attrs.time as string || '',
          value: child.attrs.value as string || '0',
          duration: child.attrs.time ? this.parseTimeToSeconds(child.attrs.time as string) : undefined,
          lastUpdated: new Date()
        };
        effects.push(effect);
      }
    }
    
    this.updateEffects(effects);
    return true;
  }

  /**
   * Process injuries dialog
   */
  private processInjuriesDialog(tag: GameTag): boolean {
    // This would need more complex logic for injury pairing
    // For now, just mark as processed
    return false;
  }

  /**
   * Process compass tags
   */
  private processCompassTag(tag: GameTag): boolean {
    const directions: Array<DirectionData> = [];
    
    // Extract directions from compass data
    for (const child of tag.children || []) {
      if (child.name === 'dir') {
        directions.push({
          direction: child.attrs.value as string || '',
          available: true,
          hidden: false
        });
      }
    }
    
    this.updateCompass(directions);
    return true;
  }

  /**
   * Process navigation tags
   */
  private processNavigationTag(tag: GameTag): boolean {
    // Handle navigation events
    return false;
  }

  /**
   * Process room tags
   */
  private processRoomTag(tag: GameTag): boolean {
    const roomData: Partial<RoomState> = {
      title: tag.attrs.title as string || '',
      description: tag.text || ''
    };
    
    this.updateRoom(roomData);
    return true;
  }

  /**
   * Process stream tags
   */
  private processStreamTag(tag: GameTag): boolean {
    // Handle stream configuration changes
    return false;
  }

  /**
   * Generic state update method with immutability
   */
  private updateState(updater: (state: GameState) => void, changePath: string): void {
    const previousValue = this.getNestedValue(this._state, changePath);
    
    // Create deep copy for immutability
    const newState = this.deepClone(this._state);
    
    // Apply update
    updater(newState);
    
    // Update state reference
    this._state = newState;
    
    // Update metadata
    this.updateMetadata();
    
    // Notify listeners
    const newValue = this.getNestedValue(this._state, changePath);
    this.notifyListeners({
      type: changePath as StateChangeType,
      path: changePath,
      previousValue,
      newValue,
      timestamp: new Date()
    });
  }

  /**
   * Create default game state
   */
  private createDefaultState(): GameState {
    return {
      character: {
        vitals: {
          health: { label: "health" },
          mana: { label: "mana" },
          stamina: { label: "stamina" },
          spirit: { label: "spirit" },
          mind: { label: "mind" },
          stance: { label: "stance", value: "offensive", percent: 0 },
          encumbrance: { label: "encumbrance", value: "none", percent: 0 }
        },
        injuries: {
          raw: [],
          processed: [],
          anatomicalOrder: ['head', 'neck', 'chest', 'abdomen', 'back', 'rightarm', 'leftarm', 'righthand', 'lefthand', 'rightleg', 'leftleg', 'nerves'],
          display: {
            bodyPartNames: new Map(),
            severityColors: new Map(),
            enablePairing: true,
            anatomicalOrder: []
          }
        },
        effects: {
          active: [],
          expired: [],
          timers: new Map(),
          config: {
            maxExpiredRetention: 10,
            enableTimers: true,
            sortBy: 'duration',
            autoRemoveExpired: true,
            timerUpdateIntervalMs: 1000
          }
        },
        equipment: {
          hands: {
            left: null,
            right: null,
            spell: null
          }
        },
        identity: {
          name: '',
          sessionId: ''
        }
      },
      environment: {
        room: {
          title: '',
          description: '',
          exits: []
        },
        compass: {
          directions: [],
          visible: true,
          config: {
            showHidden: false,
            highlightExits: true,
            enableClickToMove: false,
            showIndicators: true,
            displayStyle: 'grid'
          }
        }
      },
      streams: {
        configs: new Map(),
        active: new Map(),
        global: {
          defaultRetention: 1000,
          globallyEnabled: true,
          priorityOrder: ['speech', 'thoughts', 'logons', 'logoffs', 'death'],
          memoryManagement: {
            autoTrimEnabled: true,
            trimIntervalMinutes: 30,
            maxMemoryUsageMB: 50,
            memoryWarningThresholdMB: 30,
            trimStrategy: 'oldest',
            archiveTrimmed: false
          },
          defaultFilters: {},
          windowManagement: {
            maxOpenStreams: 10,
            autoCloseInactive: false,
            inactiveTimeoutMinutes: 60,
            positioning: 'tabs',
            defaultWindowSize: {
              width: 400,
              height: 300
            }
          },
          crossStream: {
            enableCrossSearch: true,
            enableMerging: false,
            mergedStreams: [],
            correlationRules: []
          }
        },
        processing: {
          active: new Set(),
          queue: [],
          statistics: {
            totalTasksProcessed: 0,
            tasksLastHour: 0,
            averageProcessingTimeMs: 0,
            currentQueueSize: 0,
            errorsLastHour: 0,
            efficiencyRatio: 1
          },
          errors: []
        }
      },
      ui: {
        panels: {
          hud: {
            vitals: true,
            injuries: true,
            effects: true,
            compass: true,
            room: true,
            hands: true,
            layout: {
              panelOrder: ['vitals', 'injuries', 'effects', 'compass', 'room', 'hands'],
              collapsed: new Map(),
              sizes: new Map(),
              autoCollapse: {
                enabled: false,
                collapseOnSmallScreen: true,
                screenSizeThreshold: 768,
                collapseOnInactivity: false,
                inactivityTimeoutMinutes: 30
              }
            }
          },
          streams: {
            speech: false,
            thoughts: false,
            logons: false,
            logoffs: false,
            death: false,
            inventory: false,
            custom: new Map(),
            layout: {
              arrangement: 'tabs',
              positions: new Map(),
              groups: [],
              defaultSize: {
                width: 400,
                height: 200,
                resizable: true
              }
            }
          },
          utility: {
            debug: false,
            settings: false,
            help: false,
            commandHistory: false,
            performance: false,
            search: false,
            stateInspector: false
          },
          custom: new Map(),
          management: {
            enableDragging: false,
            enableResizing: true,
            enableDocking: false,
            animationDurationMs: 200,
            autoSaveLayout: true,
            saveIntervalMinutes: 5
          }
        },
        theme: {
          current: 'original',
          available: [],
          customizations: new Map(),
          darkMode: {
            preference: 'auto',
            autoSwitch: false,
            current: 'light'
          },
          colorScheme: {
            primary: '#007acc',
            secondary: '#6c757d',
            accent: '#ffc107',
            background: '#ffffff',
            surface: '#f8f9fa',
            text: '#212529',
            error: '#dc3545',
            warning: '#ffc107',
            success: '#28a745',
            info: '#17a2b8'
          },
          typography: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            monospaceFontFamily: 'Consolas, Monaco, monospace',
            fontSize: 14,
            fontScale: 1.2,
            lineHeight: 1.5,
            letterSpacing: 0,
            fontWeight: {
              normal: 400,
              bold: 700,
              light: 300,
              medium: 500
            }
          },
          animations: {
            enabled: true,
            reduceMotion: false,
            durationScale: 1,
            easing: 'ease-in-out',
            animations: new Map()
          }
        },
        layout: {
          mode: 'standard',
          panelLayout: {
            hudWidth: 300,
            streamHeight: 200,
            feedHeight: 400,
            commandBarHeight: 40,
            margins: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 8, right: 8, bottom: 8, left: 8 }
          },
          responsive: {
            currentBreakpoint: 'desktop',
            adaptiveLayout: true,
            breakpoints: new Map(),
            behavior: {
              autoHidePanels: false,
              collapseNavigation: false,
              mobileOptimized: false,
              responsiveFonts: true
            }
          },
          grid: {
            enabled: false,
            columns: 12,
            gutterSize: 16,
            containerWidth: 1200,
            breakpointColumns: new Map()
          },
          spacing: {
            baseUnit: 8,
            scale: [0, 4, 8, 16, 24, 32, 48, 64],
            components: new Map(),
            consistent: true
          }
        },
        preferences: {
          accessibility: {
            highContrast: false,
            reducedMotion: false,
            fontSize: 'normal',
            screenReader: false,
            keyboardNavigation: true,
            focusIndicators: true,
            colorBlindAssist: false
          },
          interaction: {
            clickToMove: false,
            doubleClickCommands: false,
            keyboardShortcuts: true,
            hoverDelay: 500,
            touchGestures: true,
            dragAndDrop: true,
            contextMenu: {
              enabled: true,
              delay: 500,
              showShortcuts: true,
              customItems: []
            }
          },
          development: {
            showDebugInfo: false,
            enableVerboseLogging: false,
            showPerformanceMetrics: false,
            enableHotReload: true,
            showComponentBoundaries: false,
            enableStateInspector: false
          },
          performance: {
            enableVirtualization: true,
            virtualizationThreshold: 100,
            enableMemoization: true,
            lazyLoading: true,
            imageOptimization: true,
            bundleOptimization: true
          },
          localization: {
            language: 'en',
            availableLanguages: ['en'],
            dateFormat: 'MM/dd/yyyy',
            timeFormat: 'HH:mm:ss',
            numberFormat: 'en-US',
            textDirection: 'ltr'
          }
        },
        viewport: {
          dimensions: {
            width: 1024,
            height: 768,
            availableWidth: 1024,
            availableHeight: 768,
            devicePixelRatio: 1
          },
          type: 'desktop',
          orientation: 'landscape',
          scaleFactor: 1,
          fullScreen: false
        },
        interaction: {
          focusedElement: undefined,
          activeModal: undefined,
          dragDrop: undefined,
          hover: undefined,
          selection: undefined
        }
      },
      session: {
        connection: {
          status: 'disconnected',
          connectedAt: undefined,
          lastActivity: undefined,
          attemptCount: 0,
          config: {
            host: 'localhost',
            port: 8000,
            protocol: 'tcp',
            autoReconnect: true,
            reconnectIntervalSeconds: 5,
            maxReconnectAttempts: 10,
            timeoutSeconds: 30,
            keepAlive: {
              enabled: true,
              intervalSeconds: 30,
              timeoutSeconds: 10,
              maxMissed: 3
            }
          },
          network: {
            latency: 0,
            bandwidth: 0,
            packetLoss: 0,
            quality: 'excellent',
            monitoringEnabled: false
          },
          history: []
        },
        identity: {
          name: 'default',
          sessionId: this.generateSessionId(),
          createdAt: new Date(),
          type: 'game',
          source: 'user',
          tags: [],
          metadata: {}
        },
        statistics: {
          eventsProcessed: 0,
          commandsSent: 0,
          bytesReceived: 0,
          bytesSent: 0,
          duration: 0,
          activeTime: 0,
          performance: {
            averageEventProcessingTime: 0,
            peakMemoryUsage: 0,
            averageMemoryUsage: 0,
            renderFrameRate: 60,
            cpuUsage: 0,
            networkUtilization: 0,
            history: []
          },
          activity: {
            commandsPerMinute: 0,
            peakCommandsPerMinute: 0,
            averageResponseTime: 0,
            idleTimePercentage: 0,
            activityPattern: {
              type: 'steady',
              confidence: 0,
              description: '',
              metrics: {}
            },
            mostActiveHours: []
          },
          errors: {
            totalErrors: 0,
            errorsPerHour: 0,
            errorsByType: new Map(),
            errorsBySeverity: new Map(),
            recentErrors: [],
            resolutionRate: 0
          }
        },
        commandHistory: {
          entries: [],
          currentIndex: -1,
          maxSize: 100,
          config: {
            saveToDisk: false,
            filterDuplicates: true,
            excludePatterns: [],
            autoCategorize: false,
            completionEnabled: true,
            searchEnabled: true,
            exportImportEnabled: false
          },
          statistics: {
            totalCommands: 0,
            commandsByCategory: new Map(),
            mostUsedCommands: [],
            averageCommandsPerSession: 0,
            frequencyOverTime: []
          },
          favorites: []
        },
        configuration: {
          autoSave: {
            enabled: true,
            intervalMinutes: 5,
            maxSaveFiles: 10,
            saveOnExit: true,
            saveOnError: true,
            compression: false
          },
          logging: {
            enabled: false,
            level: 'info',
            rotation: true,
            maxFileSizeMB: 10,
            retentionDays: 7,
            includePerformance: false
          },
          backup: {
            enabled: false,
            intervalHours: 24,
            maxBackupFiles: 7,
            encryption: false,
            incremental: true
          },
          performance: {
            monitoringEnabled: false,
            monitoringIntervalSeconds: 60,
            alerting: false,
            thresholds: {
              memoryWarningMB: 100,
              memoryCriticalMB: 200,
              cpuWarningPercent: 80,
              frameRateWarningFPS: 30,
              eventProcessingWarningMs: 100
            },
            autoOptimization: false
          },
          security: {
            encryptionEnabled: false,
            sessionTimeoutMinutes: 480,
            inactivityTimeoutMinutes: 60,
            secureStorage: false,
            auditLogging: false,
            accessControl: {
              authenticationRequired: false,
              authorizationLevels: [],
              ipRestrictions: []
            }
          }
        }
      },
      meta: {
        version: "1.0.0",
        lastUpdated: new Date(),
        sessionId: this.generateSessionId(),
        debug: this._config.enableDebug ? {
          eventCount: 0,
          memoryUsage: 0,
          lastEventSequence: 0,
          performance: {
            avgEventProcessingTime: 0,
            avgStateDerivationTime: 0,
            recentUpdateCount: 0
          }
        } : undefined
      }
    };
  }

  /**
   * Update metadata after state changes
   */
  private updateMetadata(): void {
    this._updateCount++;
    this._lastUpdateTime = new Date();
    
    this._state.meta.lastUpdated = this._lastUpdateTime;
    
    if (this._state.meta.debug) {
      this._state.meta.debug.eventCount = this._gameLog.getTotalEventCount();
      this._state.meta.debug.memoryUsage = this._gameLog.getMemoryUsageEstimate();
    }
  }

  /**
   * Handle game log events
   */
  private handleGameLogEvent: GameLogEventListener = (event) => {
    // Could trigger additional state updates based on log events
    // For now, just track in debug info
    if (this._state.meta.debug && event.type === 'event.appended') {
      this._state.meta.debug.lastEventSequence = event.event.sequence;
    }
  };

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(event: StateChangeEvent): void {
    for (const listener of this._listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error notifying state change listener:', error);
      }
    }
  }

  /**
   * Deep clone an object for immutability
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }
    
    if (obj instanceof Map) {
      return new Map([...obj.entries()]) as T;
    }
    
    if (obj instanceof Set) {
      return new Set([...obj.values()]) as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as T;
    }
    
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  }

  /**
   * Get nested value from object by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Parse time string to seconds
   */
  private parseTimeToSeconds(timeStr: string): number {
    const match = timeStr.match(/(\d+):(\d+)/);
    if (match) {
      const [, minutes, seconds] = match;
      return parseInt(minutes) * 60 + parseInt(seconds);
    }
    return 0;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}