# TIME_COMPLEXITY

## Symbols
- `D` = number of drivers
- `R` = number of non-priority riders
- `P` = number of priority riders
- `K` = cost of `calculateScore(driver, rider)` (distance + capacity + amenities check)
- `S` = number of riders spawned in one frame (in `spawnController`)

If amenities are treated as constant-size arrays, then `K = O(1)`.

## Big-O By Function

| Function | Worst-Case Time | Notes |
|---|---:|---|
| `addRider` | `O(D * K)` | Linked-list insert is `O(1)`, then calls `matchDriverToSingle` which scans all drivers. |
| `matchDriverToSingle` | `O(D * K)` | Single pass over all drivers, compute score for each available driver. |
| `matchRiderToSingle` | `O((P + R) * K)` | Scans priority list first, then regular rider list if no priority match. |
| `updateWaitingRiders` | `O(P + R)` | One pass through both rider lists; each rider update is constant work. |
| `moveDrivers` | `O(D + C*(P+R)*K)` | Base loop over all drivers is `O(D)`. For each dropoff-complete driver (`C` drivers), it calls `matchRiderToSingle`. Worst case `C=D` gives `O(D*(P+R)*K)`. |
| `spawnController` | `O(1 + S*D*K)` | Controller math is `O(1)`, but each spawn triggers `addRider` -> matching over drivers. |

## Main Bottlenecks
- The dominant costs are matching scans:
  - `matchDriverToSingle`: `O(D*K)`
  - `matchRiderToSingle`: `O((P+R)*K)`
- At high load, repeated matching calls inside `moveDrivers` and `spawnController` dominate runtime.
