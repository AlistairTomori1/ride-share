# I/O History

This document focuses on how we used inputs and outputs to tune the simulation while we were building it. By the end of the project, the most important inputs were not just the buttons in the interface. The important inputs were the values we kept changing during testing: driver count, spawn-controller values, busy-ratio targets, simulation speed, grid size, and batch-run length. The most important outputs were the results those changes produced: busy-driver percentage, expirations, rider backlog, movement stability, and long-run stats.

## Why I/O Mattered In This Project

Early in the project, we mostly thought about input/output in a simple way:
- input = button presses and settings
- output = the map, driver list, and rider list

As the project got more complete, input/output became part of tuning and debugging. We started using the simulation almost like a test bench. We would change one input, run the sim, and then look at measurable outputs to decide if the system was behaving the way we wanted.

That is why this document is centered on tuning first.

## Main Tuning Inputs We Used

The most important values we changed while building the sim were:
- rider spawn logic and spawn-controller gains
- target busy ratio presets
- simulation speed
- driver count
- grid size
- batch run length

## 1. Spawn Controller Tuning

The spawn controller was the biggest tuning problem in the whole project. A fixed rider spawn interval was not good enough. It could look fine with one driver count and then fail completely when the number of drivers changed.

### Early Behavior

In early versions, the simulation was tuned mostly by feel while testing with about `5` drivers. That worked well enough visually at first, but as soon as we changed the size of the driver list, the balance broke down.

Examples of what we saw:
- with small fleets, all drivers could stay overloaded
- with larger fleets, too many drivers could stay idle
- spawn timing that looked okay at `5` drivers did not automatically work at `10` drivers or above

### Driver Counts We Tested During Spawn Tuning

| Driver Count | What We Used It For |
| --- | --- |
| `5` | early visual testing and basic spawn balance |
| `10` | small-scale balance testing |
| `100` | medium-load spawn behavior |
| `1000` | large-load Level 4 testing |
| `20000` | stress testing and upper-limit experiments |

### Busy-Ratio Targets We Added

To make the spawn system easier to test, we added busy-ratio targets:
- `50%`
- `65%`
- `85%`
- `100%`
- `120%`

This gave us a clearer input scale:
- `50%` = lots of idle capacity
- `65%` = moderate demand
- `85%` = busy but controlled
- `100%` = drivers should stay almost fully occupied without much queue buildup
- `120%` = deliberate overload mode

### Results We Actually Got While Tuning

These were some of the useful outputs we recorded while tuning the spawn controller:

| Target Setting | Result We Got | What It Meant |
| --- | --- | --- |
| `85%` | about `93%` busy | too much demand, controller was overshooting |
| all presets | around `85%` busy | controller was not responding strongly enough to the chosen target |
| `85%` | about `80%` busy | controller had over-corrected too far downward |
| `100%` | about `63%` busy | controller was not producing enough demand to keep drivers fully busy |
| `120%` | about `99%` busy | overload mode behaved better than `100%`, which showed the queue target was wrong |
| `65%` | about `66%` busy | close enough to target |
| `50%` | about `55%` busy | slightly high, but much closer |
| `100%` | about `60` expirations per hour | queue was too large for what should have been a balanced full-utilization setting |

Those results were important because they showed that the spawn controller could be wrong in different ways:
- overshooting
- undershooting
- ignoring the chosen preset
- keeping too much rider backlog

### Controller Values We Adjusted

We changed the controller a lot while tuning it. Some of the specific values we adjusted were:

- proportional busy-error gain: tested values like `0.35`, then `0.45`
- integral term contribution: `0.015`
- completion-rate EMA smoothing: `0.10`
- spawn-rate EMA smoothing: `0.20`
- queue penalty values: increased up to values like `2.8`
- rate cap: up to `driverCount * 0.5`

We also changed the allowed waiting queue logic multiple times.

A major decision was:
- for targets up to `100%`, the desired queue should stay very close to `0`
- for targets above `100%`, the system is allowed to build more backlog on purpose

That fixed a major problem where `100%` was acting more like overload mode instead of balanced full utilization.

### Why We Chose The Final Meaning Of The Presets

We wanted the presets to mean something specific when we tested them:

- `50%` and `65%` should clearly leave idle drivers
- `85%` should feel active but stable
- `100%` should keep drivers occupied without causing heavy expiration
- `120%` should intentionally stress the system and allow backlog to grow

That made the tuning inputs much more useful than just “slow demand” or “fast demand.”

## 2. Simulation Speed Tuning

Simulation speed became another major tuning input because it changed how quickly we could test time-based behavior and also exposed bugs that did not show up at lower speed.

### Final Speed Presets

- `0.5X`
- `1X`
- `2X`
- `10X`

### Final Clock Behavior

- `1X`: `1` real second = `1` simulated minute
- `2X`: `1` real second = `2` simulated minutes
- `0.5X`: `1` real second = `30` simulated seconds
- `10X`: `1` real second = `10` simulated minutes

### What We Learned From Speed Testing

Speed settings helped us test:
- rider expiration
- long-term stats
- surge behavior
- event-log growth
- movement stability

They also exposed bugs.

Examples:
- at `10X`, we saw drivers jittering around pickup points before movement logic was fixed
- at `10X` with larger driver counts, we saw riders not being removed correctly after dropoff in earlier versions
- display and text behavior also exposed problems at higher speed during development

So speed was not just a convenience feature. It became one of the main stress-test inputs.

## 3. Grid Size Tuning

Grid size affected both the look of the simulation and the way bugs were exposed.

### Grid Sizes We Tested

- `5`
- `10`
- `20`
- `40`
- `80`

### What We Observed

| Grid Size | Result |
| --- | --- |
| `5` | very dense, useful for compact testing, but exposed rider spawn-location bugs |
| `10` | still dense and also exposed spawn-location issues |
| `20` | moderate density |
| `40` | best overall balance for normal use |
| `80` | very spread out, readable, but less practical as a default |

### Final Decision

We chose `40` as the default because it gave the best balance between:
- readability
- movement visibility
- rider spacing
- normal testing conditions

Smaller grid sizes were still useful during tuning because they helped expose problems. For example, when the grid size was `5` or `10`, we found that riders could spawn incorrectly near the top-left area. That bug might have been much harder to notice if we had only tested one grid size.

## 4. Driver Count Tuning

Driver count was one of the main testing inputs throughout the project.

### Key Driver Counts We Used

| Driver Count | Reason |
| --- | --- |
| `5` | early testing |
| `10` | balancing rider spawn rate |
| `100` | medium-load testing |
| `1000` | Level 4 large-load testing |
| `20000` | extreme stress testing |

### What We Learned

- `5` and `10` were useful for checking whether the simulation looked correct.
- `100` was where balancing became more meaningful.
- `1000+` was where performance problems started to matter much more.

This is part of why we added:
- text-only mode
- batch mode
- visible stats
- event-log download
- virtualization in the text panels

Those features were not only presentation changes. They were part of how we made larger tests possible.

## 5. Batch Run Tuning

Batch mode became important once we wanted to evaluate the simulation over longer periods instead of only watching short visual runs.

### Main Batch Input We Used

The most important batch input we used was:
- `6` simulated hours

### What We Used That For

We used longer batch runs to test:
- average busy-driver percentage
- expired rides per hour
- whether the spawn controller was actually matching its target
- whether stats looked stable over time

### Why It Mattered

A short live run can make the simulation look fine even when the long-run numbers are bad. Batch mode let us judge the system based on data instead of just visual impressions.

## 6. Stats As Tuning Outputs

As the project got more complete, the stats tab became one of the most important outputs.

The main outputs we used while tuning were:
- average wait time
- average ride time
- expired rides per hour
- average percent of busy drivers
- total rides done

Examples of how we used those outputs:
- if busy percentage was too low, demand was probably too weak
- if expired rides per hour was too high, the queue was probably too large
- if total rides were increasing but expirations were also high, the controller might still be over-spawning riders

## 7. Final Tuning Decisions

By the end of the project, the main settings we settled on were:

- default grid size: `40`
- speed presets: `0.5X`, `1X`, `2X`, `10X`
- busy-ratio presets: `50%`, `65%`, `85%`, `100%`, `120%`
- common batch test length: `6` hours
- visible event-log cap: `200`
- visible expired-rider cap: `200`

We kept those settings because they gave us the best combination of:
- clear visual testing
- long-run tuning ability
- large-load testing support
- meaningful stats output

## Supporting Input/Output Reference

The main focus of this document is the tuning process above. For completeness, the main simulation inputs and outputs are summarized below.

### User Inputs

| Input | Type | What It Does |
| --- | --- | --- |
| Pause | Button | Starts or stops the live simulation. |
| Speed controls | Buttons | Changes simulation speed to `0.5X`, `1X`, `2X`, or `10X`. |
| Surge | Button | Instantly adds 10 new ride requests. |
| Text only mode | Toggle button | Turns off map rendering and keeps the text interface. |
| Grid size | Buttons | Changes the grid size to `5`, `10`, `20`, `40`, or `80`. |
| Driver count | Input modal | Resets the simulation with a chosen number of drivers. |
| Target busy ratio | Buttons | Changes the rider spawn target to `50%`, `65%`, `85%`, `100%`, or `120%`. |
| Main tabs | Buttons | Switches between `Driver/Rider List`, `Events`, `Settings`, and `Stats`. |
| List sub-tabs | Buttons | Filters the list view between `All`, `Drivers`, `Riders`, and `Expired`. |
| Run Batch | Input modal | Runs the simulation for a selected number of simulated hours without normal rendering. |
| Download Event Log | Button | Downloads the full event history as a text file. |
| Back to Sim | Button | Returns from the end-of-simulation screen to the normal simulation view. |

### System-Generated Inputs

| Generated Input | Description |
| --- | --- |
| Driver spawn location | Each driver is created at a valid random map position. |
| Rider spawn location | Each rider request is created at a valid pickup location. |
| Rider dropoff location | Each rider is assigned a random destination. |
| Passenger count | Each rider gets a generated passenger count based on weighted probability. |
| Priority status | Some riders are marked as priority requests. |
| Amenities | Drivers and riders are given amenities or amenity requirements. |
| Request expiration | Waiting requests expire after their timer reaches zero. |
| Simulated date/time | The simulation keeps its own date and time starting at January 1, 2026, 12:00 AM. |
| Event records | The system creates assignment, pickup, dropoff, expiration, and surge events. |

### Main Outputs

| Output | Type | Description |
| --- | --- | --- |
| Map view | Visual output | Shows the grid, drivers, riders, and active movement. |
| Driver/Rider List | Text output | Shows current drivers, waiting riders, and expired riders. |
| Event log | Text output | Shows timestamped events in the `Events` tab. |
| Stats tab | Calculated output | Shows wait time, ride time, expired rides per hour, busy-driver percentage, total rides, and total earnings. |
| End-of-simulation screen | Summary output | Shows final stats after a batch run. |
| Downloaded event log | File output | Saves the full event history as a `.txt` file. |
| Simulation clock | Text output | Shows the current simulated date and time. |

## Final Note

In this project, input/output ended up being one of the main ways we improved the simulation. We were constantly adjusting values, running tests, and using the outputs to decide what the system should do next. Because of that, the tuning history above is really the most important part of our I/O history.
