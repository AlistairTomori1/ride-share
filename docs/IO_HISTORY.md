# I/O History

This document explains not only the main inputs and outputs in our ride-share dispatch simulation, but also how we tuned those inputs over time to get the simulation behaving the way we wanted.

## Purpose

At the start of the project, we thought of input and output mostly in the simple sense: buttons, driver lists, rider lists, and visual updates. As the project got larger, the input/output side became more important for tuning the simulation. We ended up using a lot of the project controls not just as user features, but as testing tools.

Because of that, this document includes:
- the main user inputs
- the main system-generated inputs
- the outputs the simulation produces
- the tuning process we used to decide on the final settings

## User Inputs

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

## System-Generated Inputs

These are values created by the simulation while it is running.

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

## Outputs

| Output | Type | Description |
| --- | --- | --- |
| Map view | Visual output | Shows the grid, drivers, riders, and active movement. |
| Driver/Rider List | Text output | Shows current drivers, waiting riders, and expired riders. |
| Event log | Text output | Shows timestamped events in the `Events` tab. |
| Stats tab | Calculated output | Shows wait time, ride time, expired rides per hour, busy-driver percentage, total rides, and total earnings. |
| End-of-simulation screen | Summary output | Shows final stats after a batch run. |
| Downloaded event log | File output | Saves the full event history as a `.txt` file. |
| Simulation clock | Text output | Shows the current simulated date and time. |

## Tuning History

## 1. Spawn Controller Tuning

The spawn controller ended up being one of the most important tuning areas in the whole project. We learned pretty quickly that a fixed rider spawn interval was not enough. It could look acceptable for one number of drivers and then behave badly as soon as the fleet size changed.

### Early tuning problem

Our first versions were tuned mostly by feel while testing with around `5` drivers. That made the simulation look okay visually, but once we changed the number of drivers to `10`, the system no longer had the same balance. Too many drivers could end up idle, or all drivers could be overloaded depending on the exact spawn values.

### Driver-count scaling tests

Examples of values we tested:
- `5` drivers: used early on for visual testing and basic spawn timing
- `10` drivers: exposed the fact that the original spawn logic did not scale well
- `100` drivers: used to test whether the spawn controller still behaved realistically under larger load
- `1000+` drivers: used for Level 4 large-load testing in text-only and batch modes

### Busy-ratio targets we added

To improve tuning, we added preset target busy ratios:
- `50%`
- `65%`
- `85%`
- `100%`
- `120%`

This gave us a controlled way to test whether the spawn system was actually reacting to a target instead of just flooding the simulation.

### Measured results during tuning

We got several useful test results while tuning:

| Target | Measured Result | What It Told Us |
| --- | --- | --- |
| `85%` | about `93%` busy | the controller was overshooting and creating too much demand |
| all presets | about `85%` busy | the controller was not responding strongly enough to the chosen target |
| `85%` | about `80%` busy | the controller had over-corrected the other way |
| `100%` | about `63%` busy | the controller was not allowing enough demand to keep all drivers busy |
| `120%` | about `99%` busy | overload mode was working better than `100%`, which showed the queue target was wrong |
| `65%` | about `66%` busy | this was close enough to the target |
| `50%` | about `55%` busy | this was slightly high, but much closer |
| `100%` with overload issue | about `60` expirations per hour | the controller was building too much queue backlog for what should have been a balanced setting |

### What we changed because of those results

We ended up changing the controller several times.

Examples of values we adjusted in the controller:
- proportional busy-error gain: values such as `0.35`, then `0.45`
- integral contribution: `0.015`
- smoothing values: `0.10` for completion-rate EMA and `0.20` for spawn-rate EMA
- queue penalty values: from smaller penalties up to stronger penalties like `2.8`
- rate cap: up to `driverCount * 0.5`

We also changed how much queue the controller was allowed to tolerate.

One important decision was:
- for targets up to `100%`, we set the desired waiting queue very close to zero
- for targets above `100%`, we allowed a larger queue on purpose

That led to the current idea:
- `100%` should mean keep drivers busy without large backlog
- `120%` should mean deliberately overload the system and allow a queue to build

### Final reasoning

The final spawn tuning was based on what we wanted the simulation to mean, not just on what looked visually busy.

We decided:
- `50%` and `65%` should leave a noticeable amount of driver idle time
- `85%` should feel busy but still stable
- `100%` should keep drivers almost fully occupied without causing large expiration numbers
- `120%` should push the system into overload on purpose

That made the settings more meaningful as test inputs.

## 2. Simulation Speed Tuning

We also tuned the simulation speed settings a lot because speed affects how easy the project is to test.

### Final speed inputs

The final speed presets are:
- `0.5X`
- `1X`
- `2X`
- `10X`

### Clock tuning

We decided that the displayed simulation clock should move faster than real life.

Final clock behavior:
- `1X`: `1` real second = `1` simulated minute
- `2X`: `1` real second = `2` simulated minutes
- `0.5X`: `1` real second = `30` simulated seconds
- `10X`: `1` real second = `10` simulated minutes

### Why we chose that

We wanted the simulation to feel active without having to wait a very long time to see time-based behavior like:
- expiration
- surge changes
- event log growth
- stat changes

### Problems we found during speed tuning

Examples:
- at `10X`, drivers could jitter over pickup points before movement was corrected
- at `10X` and larger driver counts, we found a bug where riders were not always being removed correctly after dropoff
- text color and display behavior also exposed issues at higher speed in earlier versions

These tests showed that speed settings were not just for convenience. They were useful stress tests.

## 3. Driver Count Tuning

The number of drivers became one of our main testing inputs.

### Main values we used

| Driver Count | Why We Used It |
| --- | --- |
| `5` | early visual testing |
| `10` | small simulation balance testing |
| `100` | medium-load behavior testing |
| `1000` | large-load testing for Level 4 |
| `20000` | stress-testing upper limits in high-speed mode |

### What we learned

- Small counts like `5` or `10` are useful for checking movement and UI behavior.
- Medium counts like `100` are useful for tuning the spawn controller.
- Large counts like `1000+` are where rendering and full-list scans become much more important.

This is one reason we added:
- text-only mode
- batch mode
- downloadable event logs
- virtualization in text panels

## 4. Grid Size Tuning

Grid size changed how the simulation looked and how crowded the map felt.

### Grid sizes we included

- `5`
- `10`
- `20`
- `40`
- `80`

### What we observed

| Grid Size | Result |
| --- | --- |
| `5` | very dense, useful for compact testing, but earlier versions exposed spawn-location bugs |
| `10` | still dense, also helped expose spawn-location bugs |
| `20` | moderate density |
| `40` | best overall balance for normal use |
| `80` | very spread out, useful for a different visual look but less ideal as the default |

### Final choice

We kept `40` as the default because it gave the best balance between:
- map readability
- driver movement visibility
- rider spacing
- normal testing conditions

The smaller grids were still useful because they exposed bugs. For example, when the grid size was changed to `5` or `10`, we found that ride requests could spawn incorrectly near the top-left corner, which led to a spawn-location fix.

## 5. Batch Run and Large-Load Tuning

Once the project became more complete, we needed a way to test the simulation without relying only on the live visual view.

### Inputs we added

- batch hours input
- text-only mode
- downloadable event log

### Common batch test value

A major test case was:
- `6` simulated hours

We used that run length to test:
- average busy-driver percentage
- expired rides per hour
- whether the spawn controller was actually matching its target
- how the event log and stats behaved over longer runs

### Why this mattered

Without longer runs, it was too easy to judge the sim only by how it looked for a short time. Batch testing let us use the stats as actual output data instead of just relying on visual impressions.

## 6. Stats as Tuning Output

The stats tab became one of the main outputs we used to evaluate input changes.

The most useful outputs for tuning were:
- average wait time
- average ride time
- expired rides per hour
- average percent of busy drivers
- total rides done

Examples of how we used them:
- if busy percentage was too low, demand was probably too weak
- if expired rides per hour was too high, the system was probably overloading the rider queue
- if total rides done was rising but expirations were also high, the controller might still be spawning too aggressively

## Example Tuning Scenarios

### Scenario 1: 100% target created too much queue

- **Input:** `100%` target busy ratio
- **Observed output:** around `60` expirations per hour
- **Interpretation:** the controller was allowing too much queue for a setting that should have been balanced
- **Decision:** reduce the desired waiting queue for `100%` so it behaved like near-full utilization without overload

### Scenario 2: One controller setting worked only for one fleet size

- **Input:** spawn logic tuned around `5` drivers
- **Observed output:** when changed to `10` drivers, the same settings no longer gave the same driver/rider balance
- **Interpretation:** the spawn controller needed to scale with fleet size
- **Decision:** move toward a target-ratio-based controller instead of a fixed spawn pattern

### Scenario 3: High speed exposed logic bugs

- **Input:** `10X` speed
- **Observed output:** movement jitter and rider cleanup problems became easier to notice
- **Interpretation:** some logic was only stable at lower speeds
- **Decision:** fix movement and timing behavior so higher-speed testing was still valid

## Final Input Decisions

The final major input choices were based on what gave us the best mix of realism, testing value, and stability.

### Final chosen defaults / main settings

- default grid size: `40`
- speed presets: `0.5X`, `1X`, `2X`, `10X`
- busy-ratio presets: `50%`, `65%`, `85%`, `100%`, `120%`
- common batch test length: `6` hours
- visible event log cap: `200`
- visible expired rider cap: `200`

### Why these made sense

- `40` was the best default grid size visually
- the speed presets gave both normal testing and stress testing
- the busy-ratio presets gave clear low, medium, high, full, and overload cases
- the `6` hour batch run gave enough time for statistics to become meaningful

## Final Notes

This document ended up being more than a simple list of buttons and outputs because the simulation became something we had to actively tune. Many of the most important inputs in the project were the settings we used while testing: driver count, speed, grid size, busy-ratio target, and batch run length.

The outputs that mattered most were not just the visual map. They were the measurable results from the stats tab and the event log. Those outputs helped us decide which numbers were working, which ones were causing overload, and which settings made the project behave the way we wanted.
