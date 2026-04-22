# Time Complexity Analysis

This document explains the time complexity of the current version of our ride-share dispatch simulation.

## Symbols

- `D` = number of drivers
- `R` = number of non-priority riders
- `P` = number of priority riders
- `N` = total riders, where `N = P + R`
- `M` = number of drivers that complete a dropoff during one simulation tick
- `S` = number of riders spawned during one `spawnController()` update
- `E` = number of events stored in the full downloadable event log
- `A_r` = number of amenities required by a rider
- `A_d` = number of amenities available in a driver
- `K` = cost of `calculateScore(driver, rider)`

## Scoring Cost

Our score is made of three parts:

- `scoreDistance()` -> `O(1)`
- `scoreWaitTime()` -> `O(1)`
- `scoreCapacity()` -> `O(1)`
- `scoreAmenities()` -> `O(A_r * A_d)`

So:

```text
K = O(A_r * A_d)
```

In practice, amenities are small fixed arrays, so this behaves like `O(1)` during normal runs.

## Linked List Operations

Our custom linked list is doubly linked and stores `head`, `tail`, and `size`.

| Operation | Time Complexity | Reason |
| --- | --- | --- |
| `addLink(node)` | `O(1)` | Appends directly using `tail` |
| `remove(node)` | `O(1)` | Removes using `prev` and `next` references |
| `search(predicate)` | `O(n)` | May scan the whole list |
| `traverse(callback)` | `O(n)` | Visits each node once |
| `count(state)` | `O(n)` | Scans the whole list |

## Core Simulation Functions

### `SimulationController.addDriver(driver)`

**Time Complexity:** `O(1)`

Reason:
- appends the driver to the list
- updates `availableCount`

### `SimulationController.addRider(rider)`

**Time Complexity:** `O(D * K)`

Reason:
- adds the rider to either `priorityList` or `riderList` in `O(1)`
- immediately calls `matchDriverToSingle(rider)`

The matching step dominates the cost.

### `DispatchEngine.matchDriverToSingle(rider)`

**Time Complexity:** `O(D * K)`

Reason:
- scans the full driver list
- checks only `AVAILABLE` drivers
- calculates a score for each candidate
- keeps the best-scoring match

This is one of the main bottlenecks when driver count gets large.

### `DispatchEngine.matchRiderToSingle(driver)`

**Time Complexity:** `O((P + R) * K) = O(N * K)`

Reason:
- scans the full priority rider list first
- if needed, scans the regular rider list
- calculates a score for each waiting rider
- keeps the best-scoring rider

This becomes expensive when many riders are waiting.

### `DispatchEngine.assignDriver(rider, driver)`

**Time Complexity:** `O(1)`

Reason:
- updates driver and rider state
- updates cached counters
- records an assignment event

### `DispatchEngine.recordEvent(event)`

**Time Complexity:** `O(1)` amortized

Reason:
- appends one line to the full export log array
- appends one node to the visible linked-list event log
- removes one old visible event if the visible log exceeds the cap

### `DispatchEngine.updateWaitingRiders(deltaSimSeconds)`

**Time Complexity:** `O(P + R) = O(N)`

Reason:
- scans both rider lists
- updates timers
- expires riders when needed
- records expiration events

### `DispatchEngine.trackExpiredRider(rider)`

**Time Complexity:** `O(1)`

Reason:
- appends to the expired rider list
- trims one old node if the visible cap is exceeded

## Controller and Movement Functions

### `SimulationController.moveDrivers(deltaSeconds)`

**Base traversal cost:** `O(D)`  
**Worst-case cost:** `O(D + M * (P + R) * K)`

Reason:
- scans the full driver list every tick
- moves active drivers
- when a driver finishes a dropoff, it calls `matchRiderToSingle(driver)`

If many drivers finish trips on the same tick, the rematching cost can become the dominant part of the update.

Worst case:

```text
O(D + M * (P + R) * K)
```

If `M` is close to `D`, this becomes:

```text
O(D * (P + R) * K)
```

### `SimulationController.moveRiders()`

**Time Complexity:** `O(P + R) = O(N)`

Reason:
- scans both rider lists
- updates picked-up rider positions
- removes dropped-off or expired riders in `O(1)` each

### `SimulationController.updateSurge()`

**Time Complexity:** `O(1)`

Reason:
- uses cached waiting-rider count
- computes the next surge multiplier
- optionally records a surge event

### `SimulationController.expireOldEvents()`

**Time Complexity:** `O(1)`

Reason:
- the visible event log is already kept capped at `200`, so this function does constant-time cleanup at most

## Full Tick Cost

### `SimulationController.tick(deltaSeconds)`

Each tick performs:

1. `dispatchEngine.update()` -> `O(P + R)`
2. `moveDrivers()` -> `O(D + M * (P + R) * K)`
3. `moveRiders()` -> `O(P + R)`
4. `updateSurge()` -> `O(1)`
5. `expireOldEvents()` -> `O(1)`
6. stat updates -> `O(1)`

So the full tick is:

```text
O(D + (P + R) + M * (P + R) * K)
```

or:

```text
O(D + N + M * N * K)
```

Worst case, if many drivers finish a ride on the same tick:

```text
O(D * N * K)
```

If we treat amenities as constant-size arrays, then `K = O(1)` and this simplifies to:

```text
O(D * N)
```

## Rider Spawning

### `spawnRider(id)`

**Expected Time Complexity:** `O(D * K)`

Reason:
- generating random rider data is expected `O(1)`
- the expensive part is `Simulation.addRider()`
- `addRider()` immediately triggers driver matching

So the full cost becomes:

```text
O(1 + D * K) = O(D * K)
```

### `spawnController(deltaSeconds)`

**Time Complexity:** `O(S * D * K)`

Reason:
- controller math itself is `O(1)`
- if `S` riders are spawned, each one triggers `addRider()`
- each `addRider()` calls `matchDriverToSingle()`

So:

```text
O(1 + S * D * K) = O(S * D * K)
```

Under heavier demand, this becomes another important bottleneck.

### `spawnPoissonArrivals(ratePerSimSecond, controllerSeconds)`

**Time Complexity:** `O(S)`

Reason:
- splits a long simulated update into smaller slices
- samples the number of arrivals in each slice
- spawns `S` riders total across the update

The expensive work is still the rider creation and matching triggered by each spawned rider.

## Space Complexity

Main stored structures:

- driver list -> `O(D)`
- rider list -> `O(R)`
- priority rider list -> `O(P)`
- expired rider list -> capped visible size, effectively `O(1)` for display
- visible event log -> capped visible size, effectively `O(1)` for display
- downloadable full event log -> `O(E)`

Total space usage:

```text
O(D + P + R + E)
```

## Main Bottlenecks

The main runtime bottlenecks in our current design are:

1. `matchDriverToSingle()` -> `O(D * K)`
2. `matchRiderToSingle()` -> `O(N * K)`
3. `moveDrivers()` when many drivers finish trips in the same tick
4. `spawnController()` and `spawnPoissonArrivals()` when many riders are spawned at once

## Final Summary

The current design is efficient for:
- linked-list insertion
- linked-list removal
- capped visible logs
- constant-time counter and stat updates

The current design is less efficient for:
- matching through full driver lists
- matching through full rider lists
- repeated scans through active simulation entities

So the main scaling limitation in the current version is not linked-list insertion or removal. It is the repeated full-list matching work that happens as the simulation grows.
