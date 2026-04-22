# Design Summary

This document is a short written version of the class design shown in the UML.

## Core Data Structure Classes

### `Node`

Stores the shared linked-list fields used by objects in the simulation.

**Main fields**
- `id`
- `location`
- `next`
- `prev`

### `LinkedList`

Custom doubly linked list used throughout the project.

**Main responsibilities**
- store `head`, `tail`, and `size`
- append nodes
- remove nodes
- search through nodes
- traverse through nodes

## Simulation Model Classes

### `Driver`

Represents one driver in the simulation.

**Main fields**
- `id`
- `location`
- `capacity`
- `amenities`
- `state`
- `assignedRider`
- `rotation`
- `profits`
- `tripCount`

### `RideRequest`

Represents one rider request.

**Main fields**
- `id`
- `location`
- `dropOff`
- `passengers`
- `amenitiesRequired`
- `state`
- `assignedDriver`
- `waitTimer`
- `initialWaitTimer`
- `priority`
- `spawnTime`
- `pickupTime`

### `Event`

Represents one recorded system event.

**Main fields**
- `time`
- `type`
- `driver`
- `rider`
- `event`
- `length`
- `surge`

### `ExpiredList`

Used to keep a rolling linked list of expired riders for display.

## Control Classes

### `DispatchEngine`

Handles matching, expiration, event recording, and dispatch-side counters.

**Main responsibilities**
- match a rider to the best available driver
- match an available driver to the best waiting rider
- assign drivers and riders
- expire waiting riders
- calculate ride profit
- record visible and downloadable events
- maintain cached counts such as `availableCount`, `waitingCount`, `rideAmount`, and `expireCount`

### `SimulationController`

Controls the full simulation update process.

**Main responsibilities**
- store the main linked lists
- advance simulated time
- add drivers and riders
- move drivers and riders
- update surge
- update statistics
- manage event export setup
- maintain averages for wait time, ride time, busy percentage, and expired rides per hour

## Main Relationships

- `SimulationController` owns the main linked lists and calls `DispatchEngine`
- `DispatchEngine` reads and updates the driver and rider linked lists
- `Driver`, `RideRequest`, and `Event` all connect back into linked-list storage
- `sketch.js` handles rendering, user controls, batch-run flow, high-speed chart mode, and driver POV mode, while the simulation logic stays in the controller classes

## Design Intention

Our goal was to keep the project modular:

- linked-list behavior is kept in the data structure layer
- dispatch logic is kept in `DispatchEngine`
- simulation-time behavior is kept in `SimulationController`
- UI and rendering are handled separately in `sketch.js`

That separation made it easier for us to debug the project, add Level 4 features, and document the system clearly.
