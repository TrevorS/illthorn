// ABOUTME: Core GameLogStore implementation for immutable event stream management
// ABOUTME: Provides append-only event storage with search, filtering, and performance optimization

import type { GameTag } from "../../parser/tag";
import type {
  GameLogStore,
  GameLogEvent,
  GameLogEventType,
  GameLogEventSource,
  GameLogEventMeta,
  GameLogEventCache,
  GameLogDisplayState,
  GameLogRetentionConfig,
  GameLogCache,
  GameLogMetadata,
  GameLogFilters,
  GameLogSearchState,
  GameLogSearchResult,
  GameLogVirtualizationConfig
} from "../types/game-log";

/**
 * Core implementation of the game log store
 * Manages an immutable append-only event stream with performance optimization
 */
export class GameLogStoreImpl implements GameLogStore {
  // Core event storage
  public readonly events: Array<GameLogEvent> = [];
  
  // Configuration and state
  public readonly display: GameLogDisplayState;
  public readonly retention: GameLogRetentionConfig;
  public readonly cache: GameLogCache;
  public readonly metadata: GameLogMetadata;
  
  // Internal state
  private _nextSequence: number = 0;
  private _eventIdCounter: number = 0;
  private _listeners: Set<GameLogEventListener> = new Set();
  
  // Performance tracking
  private _performanceMetrics = {
    totalAppends: 0,
    totalSearches: 0,
    averageAppendTime: 0,
    averageSearchTime: 0
  };

  constructor(config?: Partial<GameLogStoreConfig>) {
    // Initialize display state
    this.display = this.createDefaultDisplayState();
    
    // Initialize retention configuration
    this.retention = {
      maxEvents: config?.maxEvents ?? 10000,
      maxAgeHours: config?.maxAgeHours ?? 24,
      enablePersistence: config?.enablePersistence ?? false,
      autoTrimIntervalMinutes: config?.autoTrimIntervalMinutes ?? 30,
      memoryWarningThresholdMB: config?.memoryWarningThresholdMB ?? 100,
      forceCleanupThresholdMB: config?.forceCleanupThresholdMB ?? 200,
      eventTypeRetention: new Map(),
      enableArchiving: config?.enableArchiving ?? false
    };
    
    // Initialize cache
    this.cache = this.createDefaultCache();
    
    // Initialize metadata
    this.metadata = {
      created: new Date(),
      lastModified: new Date(),
      version: "1.0.0",
      statistics: this.createDefaultStatistics(),
      performance: this.createDefaultPerformanceMetrics()
    };
    
    // Start auto-trim if enabled
    if (config?.enableAutoTrim !== false) {
      this.startAutoTrim();
    }
  }

  /**
   * Append a new event to the log
   * This is the primary method for adding events to the immutable stream
   */
  appendEvent(eventData: GameLogEventInput): GameLogEvent {
    const startTime = performance.now();
    
    try {
      // Create immutable event
      const event: GameLogEvent = {
        id: this.generateEventId(),
        timestamp: new Date(),
        sequence: this._nextSequence++,
        type: eventData.type,
        source: eventData.source,
        content: [...eventData.content], // Deep copy for immutability
        streamId: eventData.streamId,
        sessionId: eventData.sessionId,
        meta: this.createEventMeta(eventData.content)
      };
      
      // Append to events array (immutable once created)
      this.events.push(event);
      
      // Update metadata
      this.metadata.lastModified = new Date();
      this.metadata.statistics.totalEvents++;
      this.metadata.statistics.eventsByType.set(
        event.type,
        (this.metadata.statistics.eventsByType.get(event.type) || 0) + 1
      );
      
      // Invalidate relevant caches
      this.invalidateFilterCaches();
      
      // Update performance metrics
      const appendTime = performance.now() - startTime;
      this.updateAppendMetrics(appendTime);
      
      // Notify listeners
      this.notifyEventAppended(event);
      
      // Check if cleanup is needed
      this.checkCleanupThresholds();
      
      return event;
    } catch (error) {
      console.error('Failed to append event to game log:', error);
      throw error;
    }
  }

  /**
   * Search events based on query and filters
   */
  searchEvents(query: string, filters?: Partial<GameLogFilters>): Array<GameLogSearchResult> {
    const startTime = performance.now();
    
    try {
      // Apply filters first to reduce search space
      const filteredEvents = this.filterEvents(filters || {});
      
      // Perform search
      const results: Array<GameLogSearchResult> = [];
      
      for (const event of filteredEvents) {
        const searchableText = this.getSearchableText(event);
        const matchIndex = searchableText.toLowerCase().indexOf(query.toLowerCase());
        
        if (matchIndex !== -1) {
          results.push({
            eventId: event.id,
            startIndex: matchIndex,
            length: query.length,
            snippet: this.createSnippet(searchableText, matchIndex, query.length),
            context: this.createContext(searchableText, matchIndex, query.length)
          });
        }
      }
      
      // Update search metrics
      const searchTime = performance.now() - startTime;
      this.updateSearchMetrics(searchTime, filteredEvents.length, results.length);
      
      return results;
    } catch (error) {
      console.error('Failed to search game log events:', error);
      return [];
    }
  }

  /**
   * Filter events based on criteria
   */
  filterEvents(filters: Partial<GameLogFilters>): Array<GameLogEvent> {
    // Check cache first
    const filterHash = this.hashFilters(filters);
    const cachedResult = this.cache.filteredLists.get(filterHash);
    
    if (cachedResult) {
      this.cache.stats.totalAccesses++;
      return cachedResult.map(id => this.getEventById(id)).filter(Boolean) as Array<GameLogEvent>;
    }
    
    // Apply filters
    let filteredEvents = [...this.events];
    
    // Filter by event types
    if (filters.eventTypes?.size) {
      filteredEvents = filteredEvents.filter(event => 
        filters.eventTypes!.has(event.type)
      );
    }
    
    // Filter by event sources
    if (filters.eventSources?.size) {
      filteredEvents = filteredEvents.filter(event => 
        filters.eventSources!.has(event.source)
      );
    }
    
    // Filter by time range
    if (filters.timeRange) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= filters.timeRange!.start &&
        event.timestamp <= filters.timeRange!.end
      );
    }
    
    // Filter by stream IDs
    if (filters.streamIds?.size) {
      filteredEvents = filteredEvents.filter(event => 
        event.streamId && filters.streamIds!.has(event.streamId)
      );
    }
    
    // Filter by sequence range
    if (filters.minSequence !== undefined) {
      filteredEvents = filteredEvents.filter(event => 
        event.sequence >= filters.minSequence!
      );
    }
    
    if (filters.maxSequence !== undefined) {
      filteredEvents = filteredEvents.filter(event => 
        event.sequence <= filters.maxSequence!
      );
    }
    
    // Cache the result
    this.cache.filteredLists.set(filterHash, filteredEvents.map(e => e.id));
    this.cache.stats.totalAccesses++;
    
    return filteredEvents;
  }

  /**
   * Get events for virtual rendering
   */
  getVirtualEvents(startIndex: number, count: number): Array<GameLogEvent> {
    return this.events.slice(startIndex, startIndex + count);
  }

  /**
   * Get total event count
   */
  getTotalEventCount(): number {
    return this.events.length;
  }

  /**
   * Get event by ID
   */
  getEventById(eventId: string): GameLogEvent | undefined {
    return this.events.find(event => event.id === eventId);
  }

  /**
   * Get recent events (last N events)
   */
  getRecentEvents(count: number): Array<GameLogEvent> {
    return this.events.slice(-count);
  }

  /**
   * Clear all events (use with caution)
   */
  clearEvents(): void {
    this.events.length = 0;
    this._nextSequence = 0;
    this.cache.filteredLists.clear();
    this.cache.renderedEvents.clear();
    this.metadata.statistics = this.createDefaultStatistics();
    this.metadata.lastModified = new Date();
    
    this.notifyEventsCleared();
  }

  /**
   * Trim old events based on retention policy
   */
  trimEvents(): number {
    const initialCount = this.events.length;
    const cutoffTime = new Date(Date.now() - this.retention.maxAgeHours * 60 * 60 * 1000);
    
    // Find events to keep (recent + within retention limits)
    const eventsToKeep = this.events
      .filter(event => event.timestamp > cutoffTime)
      .slice(-this.retention.maxEvents);
    
    // Replace events array
    this.events.length = 0;
    this.events.push(...eventsToKeep);
    
    // Clear caches that might reference removed events
    this.cache.filteredLists.clear();
    this.cache.renderedEvents.clear();
    
    const removedCount = initialCount - this.events.length;
    
    if (removedCount > 0) {
      this.metadata.lastModified = new Date();
      this.notifyEventsTrimmed(removedCount);
    }
    
    return removedCount;
  }

  /**
   * Subscribe to log events
   */
  subscribe(listener: GameLogEventListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Get current memory usage estimate
   */
  getMemoryUsageEstimate(): number {
    // Rough estimate: each event averages ~1KB
    return this.events.length * 1024;
  }

  // Private helper methods

  private generateEventId(): string {
    return `event_${Date.now()}_${this._eventIdCounter++}`;
  }

  private createEventMeta(content: GameTag[]): GameLogEventMeta {
    return {
      tagCount: content.length,
      triggeredStateChange: false, // Will be updated by state processors
      byteSize: JSON.stringify(content).length
    };
  }

  private createDefaultDisplayState(): GameLogDisplayState {
    return {
      filters: {
        eventTypes: new Set(['incoming', 'outgoing', 'system']),
        eventSources: new Set(['game', 'command', 'ui'])
      },
      search: {
        query: '',
        mode: 'text',
        caseSensitive: false,
        results: [],
        currentResult: -1,
        history: []
      },
      highlights: {
        groups: new Map(),
        enabled: true,
        patterns: [],
        liveHighlight: false
      },
      virtualization: {
        renderWindow: 100,
        bufferSize: 20,
        estimatedItemHeight: 25,
        enabled: true,
        scrollBehavior: {
          autoScrollToBottom: true,
          pauseOnUserScroll: true,
          resumeScrollTimeoutMs: 2000,
          smoothScroll: true,
          scrollAnimationDurationMs: 200
        },
        performance: {
          enableMetrics: true,
          targetFrameRate: 60,
          performanceThresholds: {
            renderTimeMs: 16,
            memoryUsageMB: 50
          }
        }
      },
      preferences: {
        showTimestamps: true,
        timestampFormat: 'absolute',
        showEventTypes: false,
        showEventSources: false,
        fontSize: 'normal',
        lineHeight: 1.4,
        showSequenceNumbers: false,
        compactMode: false,
        colorScheme: 'auto'
      }
    };
  }

  private createDefaultCache(): GameLogCache {
    return {
      renderedEvents: new Map(),
      filteredLists: new Map(),
      stats: {
        hitRate: 0,
        totalAccesses: 0,
        sizeBytes: 0,
        lastCleanup: new Date(),
        efficiency: {
          averageAccessTimeMs: 0,
          memoryEfficiencyRatio: 1,
          compressionRatio: 1
        }
      },
      config: {
        maxSizeMB: 50,
        entryTTLMinutes: 30,
        enableCompression: false,
        cleanupIntervalMinutes: 15,
        evictionPolicy: 'lru'
      }
    };
  }

  private createDefaultStatistics() {
    return {
      totalEvents: 0,
      eventsByType: new Map(),
      eventsBySource: new Map(),
      averageEventsPerHour: 0,
      storageUsageBytes: 0,
      searchOperations: 0,
      cacheOperations: 0
    };
  }

  private createDefaultPerformanceMetrics() {
    return {
      averageAppendTimeMs: 0,
      averageSearchTimeMs: 0,
      averageRenderTimeMs: 0,
      memoryUsage: {
        eventsMemoryMB: 0,
        cacheMemoryMB: 0,
        indexMemoryMB: 0,
        totalMemoryMB: 0
      },
      history: []
    };
  }

  private getSearchableText(event: GameLogEvent): string {
    // Use cached version if available
    const cached = this.cache.renderedEvents.get(event.id);
    if (cached?.plainText) {
      return cached.plainText;
    }
    
    // Extract text from GameTags
    const text = this.extractTextFromTags(event.content);
    
    // Cache the result
    const cacheEntry: GameLogEventCache = {
      plainText: text,
      cachedAt: new Date(),
      invalid: false
    };
    this.cache.renderedEvents.set(event.id, cacheEntry);
    
    return text;
  }

  private extractTextFromTags(tags: GameTag[]): string {
    return tags
      .map(tag => {
        if (tag.text) {
          return tag.text;
        }
        if (tag.children?.length) {
          return this.extractTextFromTags(tag.children);
        }
        return '';
      })
      .join(' ')
      .trim();
  }

  private createSnippet(text: string, matchIndex: number, matchLength: number): string {
    const snippetLength = 100;
    const start = Math.max(0, matchIndex - snippetLength / 2);
    const end = Math.min(text.length, matchIndex + matchLength + snippetLength / 2);
    return text.substring(start, end);
  }

  private createContext(text: string, matchIndex: number, matchLength: number): string {
    const contextLength = 200;
    const start = Math.max(0, matchIndex - contextLength / 2);
    const end = Math.min(text.length, matchIndex + matchLength + contextLength / 2);
    return text.substring(start, end);
  }

  private hashFilters(filters: Partial<GameLogFilters>): string {
    return JSON.stringify(filters);
  }

  private invalidateFilterCaches(): void {
    this.cache.filteredLists.clear();
  }

  private updateAppendMetrics(appendTime: number): void {
    this._performanceMetrics.totalAppends++;
    this._performanceMetrics.averageAppendTime = 
      (this._performanceMetrics.averageAppendTime * (this._performanceMetrics.totalAppends - 1) + appendTime) / 
      this._performanceMetrics.totalAppends;
  }

  private updateSearchMetrics(searchTime: number, eventsSearched: number, matchesFound: number): void {
    this._performanceMetrics.totalSearches++;
    this._performanceMetrics.averageSearchTime = 
      (this._performanceMetrics.averageSearchTime * (this._performanceMetrics.totalSearches - 1) + searchTime) / 
      this._performanceMetrics.totalSearches;
    
    this.metadata.statistics.searchOperations++;
  }

  private checkCleanupThresholds(): void {
    const memoryUsageMB = this.getMemoryUsageEstimate() / (1024 * 1024);
    
    if (memoryUsageMB > this.retention.forceCleanupThresholdMB) {
      this.trimEvents();
    } else if (memoryUsageMB > this.retention.memoryWarningThresholdMB) {
      console.warn(`Game log memory usage (${memoryUsageMB.toFixed(1)}MB) exceeds warning threshold`);
    }
  }

  private startAutoTrim(): void {
    setInterval(() => {
      this.trimEvents();
    }, this.retention.autoTrimIntervalMinutes * 60 * 1000);
  }

  // Event notification methods
  private notifyEventAppended(event: GameLogEvent): void {
    for (const listener of this._listeners) {
      try {
        listener({ type: 'event.appended', event });
      } catch (error) {
        console.error('Error notifying game log listener:', error);
      }
    }
  }

  private notifyEventsCleared(): void {
    for (const listener of this._listeners) {
      try {
        listener({ type: 'events.cleared' });
      } catch (error) {
        console.error('Error notifying game log listener:', error);
      }
    }
  }

  private notifyEventsTrimmed(removedCount: number): void {
    for (const listener of this._listeners) {
      try {
        listener({ type: 'events.trimmed', removedCount });
      } catch (error) {
        console.error('Error notifying game log listener:', error);
      }
    }
  }
}

// Supporting types and interfaces

export interface GameLogEventInput {
  type: GameLogEventType;
  source: GameLogEventSource;
  content: GameTag[];
  streamId?: string;
  sessionId: string;
}

export interface GameLogStoreConfig {
  maxEvents?: number;
  maxAgeHours?: number;
  enablePersistence?: boolean;
  autoTrimIntervalMinutes?: number;
  memoryWarningThresholdMB?: number;
  forceCleanupThresholdMB?: number;
  enableArchiving?: boolean;
  enableAutoTrim?: boolean;
}

export type GameLogEventListenerEvent = 
  | { type: 'event.appended'; event: GameLogEvent }
  | { type: 'events.cleared' }
  | { type: 'events.trimmed'; removedCount: number };

export type GameLogEventListener = (event: GameLogEventListenerEvent) => void;