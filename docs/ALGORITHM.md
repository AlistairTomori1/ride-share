# Algorithm Overview

This document is our high-level summary of how the current simulation runs.

## Main Simulation Loop

Each live update follows this order:

1. Advance simulated time
2. Update waiting riders and expire requests that ran out of time
3. Move drivers toward pickups or dropoffs
4. Move riders with their assigned drivers if they have already been picked up
5. Update surge multiplier
6. Update statistics
7. Spawn new riders based on the spawn controller

## Main Data Structures

- `driverList`: linked list of all drivers
- `riderList`: linked list of non-priority riders
- `priorityList`: linked list of priority riders
- `expiredList`: linked list of expired riders
- `eventLog`: linked list used for the visible event log

## Driver States

Drivers move through these states:

- `AVAILABLE`
- `PICKING UP`
- `DROPPING OFF`

## Rider States

Riders move through these states:

- `WAITING`
- `MATCHED`
- `PICKED UP`
- `DROPPED OFF`
- `EXPIRED`

## High-Level Pseudocode

```text
FUNCTION RUN_SIMULATION_STEP(deltaSeconds)
    IF simulation is paused
        RETURN

    Advance simulated clock
    Update waiting riders
    Move drivers
    Move riders
    Update surge
    Update stats
    Spawn riders if needed
```

## Expiration Logic

```text
FUNCTION UPDATE_WAITING_RIDERS()
    FOR each rider in riderList
        IF rider is WAITING and has no assigned driver
            Decrease wait timer
            IF timer <= 0
                Mark rider as EXPIRED
                Add rider to expired list
                Record expiration event

    REPEAT the same process for priorityList
```

## Matching Logic

### When a new rider is added

```text
FUNCTION ADD_RIDER(rider)
    Add rider to priorityList or riderList
    Match that rider to the best available driver
```

```text
FUNCTION MATCH_DRIVER_TO_SINGLE(rider)
    bestDriver = null
    bestScore = Infinity

    FOR each driver in driverList
        IF driver is AVAILABLE
            score = CALCULATE_SCORE(driver, rider)
            IF score < bestScore
                bestScore = score
                bestDriver = driver

    IF bestDriver exists
        Assign driver to rider
```

### When a driver finishes a dropoff

```text
FUNCTION MATCH_RIDER_TO_SINGLE(driver)
    Search priorityList first for the best WAITING rider
    IF no priority rider is found
        Search riderList for the best WAITING rider

    IF a rider is found
        Assign driver to rider
```

## Score Calculation

```text
FUNCTION CALCULATE_SCORE(driver, rider)
    distanceScore = Manhattan distance between driver and rider

    IF driver capacity is too small
        RETURN Infinity

    IF rider requires amenities that the driver does not have
        RETURN Infinity

    RETURN distanceScore
```

## Driver Movement

```text
FUNCTION MOVE_DRIVERS()
    FOR each driver in driverList
        IF state is PICKING UP
            Move driver toward rider pickup location
            IF driver reaches pickup
                Mark rider as PICKED UP
                Change driver state to DROPPING OFF
                Record pickup event

        ELSE IF state is DROPPING OFF
            Move driver toward rider dropoff location
            IF driver reaches dropoff
                Mark rider as DROPPED OFF
                Update profits and ride stats
                Change driver state to AVAILABLE
                Try to match driver to another waiting rider
                Record dropoff event
```

## Rider Movement and Cleanup

```text
FUNCTION MOVE_RIDERS()
    FOR each rider in riderList and priorityList
        IF rider is PICKED UP
            Set rider location to driver location

        IF rider is DROPPED OFF
            Remove rider from its linked list
```

## Spawn Controller

```text
FUNCTION SPAWN_CONTROLLER(deltaSeconds)
    Measure current busy-driver ratio
    Measure waiting riders per driver
    Measure completed rides since the last update

    Use those values to compute a spawn rate
    Add that rate into spawnBudget

    WHILE spawnBudget >= 1
        Spawn one rider
        Decrease spawnBudget by 1
```

## Summary

The simulation is event-driven around two main matching moments:

- when a rider is created
- when a driver becomes available after a dropoff

This keeps the simulation simpler than matching every rider to every driver every frame, while still using the linked lists as the main storage structure throughout the system.
