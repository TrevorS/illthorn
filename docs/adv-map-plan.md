# Advanced Graph-Based Room Navigation UI Plan

## Executive Summary

This document outlines a comprehensive plan to replace Illthorn's current compass system with an intelligent graph-based room navigation UI. Instead of a static directional grid, this system will visualize rooms as nodes and exits as edges in an interactive graph, providing spatial context, multi-hop navigation planning, and enhanced exploration capabilities.

## Current State Analysis

### Existing Compass Limitations
The current compass (`compass-ui.lit.ts` and `compass-container.lit.ts`) provides:
- Simple 3×5 grid showing directional exits (n/s/e/w/ne/nw/se/sw/up/down/out)
- Binary on/off state for each direction
- No spatial relationship context
- No information about destination rooms
- No pathfinding or multi-step navigation support

### Technical Architecture
- Receives data from `metadata/compass` events
- Shows only immediate exits from current room
- No integration with broader mapping systems
- Limited to 15 predefined directional slots

## Graph-Based Navigation Vision

### Core Design Philosophy
Transform navigation from directional awareness to **spatial intelligence**:

1. **Contextual Awareness**: Show not just where you can go, but what's there
2. **Multi-hop Planning**: Visualize rooms 1-2 steps away for better navigation decisions
3. **Interactive Pathfinding**: Click-to-travel with automatic route calculation
4. **Rich Metadata**: Display room types, conditions, and special properties
5. **Adaptive Layout**: Graph adjusts based on discovered connections

### Visual Concepts

#### Layout Algorithms
1. **Radial Layout**: Current room at center, adjacent rooms in concentric circles
2. **Force-Directed Graph**: Rooms positioned by connection strength and frequency
3. **Hierarchical Clustering**: Group rooms by area/zone with visual boundaries
4. **Mini-Map Mode**: Zoomed-out view of larger connected area network

#### Node (Room) Representation
- **Current Room**: Prominent center position with distinct styling
- **Adjacent Rooms**: Labeled nodes showing room titles/names
- **Room Metadata**: Color coding for room types (safe zones, shops, dungeons, etc.)
- **Visit Frequency**: Node size varies by importance/frequency of visits
- **Special Rooms**: Icons for banks, temples, shops, training areas

#### Edge (Exit) Representation
- **Standard Exits**: Simple directed arrows between rooms
- **Special Movement**: Styled arrows for climb, swim, special requirements
- **Hidden Exits**: Dashed or dotted lines for discovered secret passages
- **Locked/Blocked**: Red or crossed-out edges for inaccessible paths
- **Bidirectional vs One-way**: Clear visual distinction

## Technical Architecture

### Component Structure

```typescript
// Core graph visualization component
illthorn-room-graph-ui
├── SVG-based rendering engine
├── Layout algorithm implementations
├── Interactive event handling (click, hover, zoom)
└── Animation system for smooth transitions

// Session data integration container
illthorn-room-graph-container
├── Session event subscription
├── Map database integration
├── State management for discovered rooms
└── Pathfinding coordinate
```

### Data Model Extensions

#### Core Interfaces
```typescript
interface GraphRoom {
  id: string;
  title: string;
  description?: string;
  type: RoomType;
  position: GraphPosition;
  metadata: RoomMetadata;
  exits: Array<GraphExit>;
  visitCount: number;
  lastVisited: Date;
}

interface GraphExit {
  direction: string;
  destinationId: string;
  type: ExitType;
  requirements?: ExitRequirement;
  hidden: boolean;
  bidirectional: boolean;
}

interface MapGraph {
  rooms: Map<string, GraphRoom>;
  connections: Array<GraphConnection>;
  areas: Map<string, GraphArea>;
  currentRoomId: string;
  discoveredRadius: number;
}
```

#### Integration with Existing Types
- Extend `EnvironmentState` with `mapGraph: MapGraph`
- Enhance `RoomState` with graph-specific positioning data
- Add `GraphConfig` to `CompassConfig` for layout preferences

### Map Database Service

```typescript
interface MapDatabase {
  // Room discovery and storage
  addRoom(room: GraphRoom): void;
  getRoom(id: string): GraphRoom | undefined;
  updateRoomConnections(roomId: string, exits: Array<ExitData>): void;
  
  // Pathfinding and navigation
  findPath(fromId: string, toId: string): Array<string>;
  getAdjacentRooms(roomId: string, hops: number): Array<GraphRoom>;
  
  // Area and zone management
  getAreaRooms(areaId: string): Array<GraphRoom>;
  detectRoomArea(room: GraphRoom): string | undefined;
  
  // Import/export for go2 compatibility
  importGo2Data(data: Go2MapData): void;
  exportMapData(): MapExportFormat;
}
```

### Layout Algorithms

#### Radial Layout
- Current room at center (0,0)
- Adjacent rooms in first ring at fixed radius
- 2-hop rooms in outer ring
- Angular positioning based on compass directions when available

#### Force-Directed Layout
- Nodes repel each other (avoid overlap)
- Connected nodes attract (minimize edge length)
- Current room has stronger central force
- Frequently visited rooms have higher "mass"

#### Hierarchical Layout
- Group rooms by detected area/zone
- Use area boundaries as visual containers
- Minimize cross-area connections visually
- Expandable/collapsible area clusters

## Implementation Phases

### Phase 1: Core Graph Component (Week 1-2)
**Deliverables:**
- [ ] `RoomGraphUI` Lit component with SVG rendering
- [ ] `RoomGraphContainer` for session integration
- [ ] Basic radial layout algorithm
- [ ] Graph data structures and interfaces
- [ ] Unit tests for core components

**Technical Tasks:**
- Create SVG-based graph renderer with zoom/pan capabilities
- Implement node and edge rendering with configurable styling
- Build event system for node clicks and edge interactions
- Add responsive layout that adapts to different screen sizes

### Phase 2: Data Layer Integration (Week 3-4)
**Deliverables:**
- [ ] `MapDatabase` service implementation
- [ ] Room discovery and connection tracking
- [ ] Integration with existing `metadata/compass` events
- [ ] Basic pathfinding algorithms (BFS/Dijkstra)
- [ ] Data persistence for discovered map data

**Technical Tasks:**
- Extend centralized game state with map graph data
- Build room discovery system that learns from navigation
- Implement connection inference from compass data
- Add import/export for external map databases

### Phase 3: Interactive Features (Week 5-6)
**Deliverables:**
- [ ] Click-to-travel with path highlighting
- [ ] Hover tooltips with room details
- [ ] Multi-hop visualization controls
- [ ] Path calculation and route display
- [ ] Integration with existing session commands

**Technical Tasks:**
- Build interactive pathfinding with visual feedback
- Add command integration (`:travel <room>`, `:map <area>`)
- Implement smooth animations for room transitions
- Create context menus for room actions (bookmark, info)

### Phase 4: Advanced Layouts & Metadata (Week 7-8)
**Deliverables:**
- [ ] Force-directed and hierarchical layout options
- [ ] Room type classification and color coding
- [ ] Area detection and boundary visualization
- [ ] Visit frequency and importance scoring
- [ ] Configuration UI for layout preferences

**Technical Tasks:**
- Implement multiple layout algorithms with smooth transitions
- Build room classification system using game data
- Add area/zone detection based on room patterns
- Create user preference system for graph appearance

### Phase 5: Integration & Polish (Week 9-10)
**Deliverables:**
- [ ] Replace compass component in session layout
- [ ] Performance optimization for large maps
- [ ] Comprehensive testing with mock and real data
- [ ] Documentation and user guide
- [ ] Migration guide from old compass

**Technical Tasks:**
- Optimize rendering for maps with 100+ rooms
- Add virtualization for off-screen nodes
- Build comprehensive test suite with edge cases
- Create storybook stories for different graph states

## Integration Points

### Session Event System
- Subscribe to `metadata/compass` for real-time exit updates
- Listen for `room.entered` events to update current position
- Process `room.updated` events for description/metadata changes
- Handle `area.discovered` events for zone mapping

### Command System Integration
```typescript
// New navigation commands
:map [area]           // Show map for specific area or current area
:travel <room>        // Calculate and execute path to room
:bookmark <name>      // Save current room as bookmark
:graph <layout>       // Switch graph layout (radial, force, hierarchy)
:discover <radius>    // Set auto-discovery radius (1-3 hops)
```

### Existing UI Components
- Replace `illthorn-compass-container` in session layout
- Maintain same panel structure and collapsibility
- Preserve theme integration and CSS custom properties
- Ensure accessibility with keyboard navigation

### External Map Data
- Import go2 room database for comprehensive coverage
- Export discovered connections for sharing/backup
- Sync with Lich map script discoveries
- Support multiple map data formats

## User Experience Design

### Interaction Patterns

#### Primary Navigation
1. **Single Click**: Select room and show details
2. **Double Click**: Navigate to room (if accessible)
3. **Right Click**: Context menu (bookmark, info, travel options)
4. **Hover**: Tooltip with room name and exit info

#### Visual Feedback
- **Current Room**: Distinct highlight with larger size
- **Accessible Rooms**: Standard styling with clear labels
- **Inaccessible Rooms**: Grayed out with reason indicator
- **Path Highlighting**: Animated route when travel is planned

#### Layout Controls
- **Zoom**: Mouse wheel or pinch gestures
- **Pan**: Click and drag empty space
- **Layout Toggle**: Button to cycle through algorithms
- **Radius Control**: Slider for 1-hop vs 2-hop vs 3-hop display

### Configuration Options

```typescript
interface GraphConfig {
  // Layout preferences
  defaultLayout: 'radial' | 'force' | 'hierarchy';
  discoveryRadius: 1 | 2 | 3;
  autoCenter: boolean;
  
  // Visual preferences
  showRoomNames: boolean;
  showExitLabels: boolean;
  colorByRoomType: boolean;
  animateTransitions: boolean;
  
  // Interaction preferences
  enableClickToTravel: boolean;
  showPathPreviews: boolean;
  enableDoubleClickNav: boolean;
  
  // Performance settings
  maxVisibleNodes: number;
  enableVirtualization: boolean;
  renderDistance: number;
}
```

### Accessibility Features
- **Keyboard Navigation**: Tab through rooms, Enter to travel
- **Screen Reader Support**: ARIA labels for all interactive elements
- **High Contrast Mode**: Alternative color schemes for visibility
- **Focus Indicators**: Clear visual focus for keyboard users

## Performance Considerations

### Rendering Optimization
- **Virtualization**: Only render visible nodes within viewport
- **Level of Detail**: Reduce detail for distant or small nodes
- **Batched Updates**: Group multiple changes into single re-render
- **Canvas Fallback**: Switch to Canvas for maps with 200+ rooms

### Memory Management
- **LRU Cache**: Limit stored room data to prevent memory leaks
- **Lazy Loading**: Load room details only when needed
- **Connection Pruning**: Remove old connections that are no longer valid
- **State Cleanup**: Proper cleanup when switching sessions

### Network Efficiency
- **Incremental Updates**: Only sync changed room data
- **Compression**: Compress map data for storage and transfer
- **Background Loading**: Prefetch adjacent room data during idle time
- **Caching Strategy**: Cache frequently accessed map regions

## Migration Strategy

### Backwards Compatibility
- Maintain compass data format for existing scripts
- Provide fallback to old compass if graph fails to load
- Support both compass and graph simultaneously during transition
- Preserve all existing compass-related commands and settings

### User Adoption
1. **Opt-in Beta**: Allow users to enable graph mode in settings
2. **Side-by-side**: Show both compass and mini-graph initially
3. **Progressive Enhancement**: Add features gradually over updates
4. **User Education**: Provide tutorials and documentation

### Developer Migration
- Maintain existing `CompassContainer` API for backwards compatibility
- Add new graph events alongside compass events
- Provide migration utilities for custom compass integrations
- Document API changes and provide upgrade guides

## Success Metrics

### User Engagement
- **Navigation Efficiency**: Reduced clicks/commands to reach destinations
- **Exploration Rate**: Increased discovery of new areas
- **Feature Adoption**: Usage of advanced features (bookmarks, pathfinding)
- **User Satisfaction**: Feedback scores and feature requests

### Technical Performance
- **Render Performance**: Maintain 60fps during graph interactions
- **Memory Usage**: Keep memory footprint under 50MB for large maps
- **Load Times**: Graph initialization under 2 seconds
- **Accuracy**: 95%+ accuracy in room connection detection

### System Integration
- **Event Throughput**: Handle compass updates without lag
- **State Consistency**: Maintain sync between graph and session state
- **Error Recovery**: Graceful handling of malformed map data
- **Cross-platform**: Consistent behavior across OS platforms

## Future Enhancements

### Advanced Features
- **3D Visualization**: Optional 3D mode for multi-level areas
- **Time-based Routing**: Consider time-of-day restrictions in pathfinding
- **Crowd-sourced Mapping**: Share discoveries with other users
- **AI-assisted Exploration**: Suggest unexplored areas based on patterns

### Integration Opportunities
- **Combat Tactical Display**: Show enemy positions and tactical advantages
- **Resource Mapping**: Overlay foraging, mining, and hunting data
- **Social Features**: Show friend locations and group gathering points
- **Achievement System**: Unlock areas and reward exploration

This comprehensive plan provides a roadmap for transforming Illthorn's navigation system from simple directional awareness to intelligent spatial navigation, enhancing the user experience while maintaining compatibility with existing systems.