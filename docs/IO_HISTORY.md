# I/O History

This document summarizes the main inputs and outputs used by the ride-share dispatch simulation.

## Purpose

The simulation accepts user controls and internally generated request/driver data, then produces visual, textual, and file-based outputs that show the current system state and performance over time.

## User Inputs

| Input | Type | Description |
| --- | --- | --- |
| Pause | Button | Starts or stops the live simulation loop. |
| Speed controls | Buttons | Changes simulation speed to `0.5X`, `1X`, `2X`, or `10X`. |
| Surge | Button | Immediately spawns 10 new ride requests. |
| Text only mode | Toggle button | Hides the map view and keeps the text-based interface. |
| Grid size | Buttons | Changes the map grid size to `5`, `10`, `20`, `40`, or `80`. |
| Driver count | Prompt/input | Resets the simulation with a chosen number of drivers. |
| Target busy ratio | Buttons | Adjusts the rider spawn controller target to `50%`, `65%`, `85%`, `100%`, or `120%`. |
| Main tabs | Buttons | Changes the visible panel between `Driver/Rider List`, `Events`, `Settings`, and `Stats`. |
| List sub-tabs | Buttons | Filters the list view between `All`, `Drivers`, `Riders`, and `Expired`. |
| Run Batch | Button + input | Runs the simulation for a selected number of simulated hours without normal rendering. |
| Download Event Log | Button | Downloads the full event log as a text file. |
| Back to Sim | Button | Returns from the end-of-simulation screen to the normal simulation view. |

## System-Generated Inputs

These values are produced internally by the simulation rather than entered directly by the user.

| Generated Input | Description |
| --- | --- |
| Driver spawn location | Each driver is placed at a random valid map location. |
| Rider spawn location | Each ride request is placed at a random valid pickup location. |
| Rider dropoff location | Each ride request is assigned a random valid destination. |
| Passenger count | Each rider is assigned a generated passenger count based on weighted probability. |
| Rider priority | Riders may be marked as priority requests. |
| Amenities | Drivers and riders are assigned amenities or amenity requirements. |
| Request expiration | Waiting requests expire after their countdown reaches zero. |
| Simulated date and time | The simulation maintains its own date/time clock starting at January 1, 2026, 12:00 AM. |
| Event records | Assignment, pickup, dropoff, expiration, and surge events are generated during the simulation. |

## Outputs

| Output | Type | Description |
| --- | --- | --- |
| Map view | Visual output | Shows the grid, drivers, riders, and active movement. |
| Driver/Rider List | Text output | Shows the current drivers, waiting riders, and expired riders. |
| Event log | Text output | Shows timestamped simulation events in the Events tab. |
| Stats tab | Calculated output | Displays average wait time, average ride time, expired rides per hour, busy-driver percentage, total rides done, and total earnings. |
| End-of-simulation screen | Summary output | Displays final simulation statistics after a batch run. |
| Downloaded event log | File output | Exports the full event history as a `.txt` file. |
| Simulation clock | Text output | Displays the current simulated date and time. |

## Example I/O Scenarios

### 1. Live Simulation Control

- Input: The user presses `Pause`.
- Processing: The simulation loop stops advancing time and movement until resumed.
- Output: The map, lists, and stats remain visible, but drivers and riders stop updating.

### 2. Rider Request Spawn and Match

- Input: The spawn controller generates a new ride request.
- Processing: The request is added to the correct rider list and the dispatch engine attempts to match it to a driver.
- Output: The rider appears on the map and in the list, and an event may be added to the event log.

### 3. Changing Simulation Speed

- Input: The user clicks `2X` or `10X`.
- Processing: The simulation speed multiplier changes.
- Output: The clock advances faster, and the simulation processes movement and dispatch updates at the selected speed.

### 4. Batch Run

- Input: The user clicks `Run Batch` and enters a number of hours.
- Processing: The simulation runs in non-visual mode until the target simulated time is reached.
- Output: An end-of-simulation summary screen appears with final statistics and a `Download Event Log` button.

### 5. Event Log Export

- Input: The user clicks `Download Event Log`.
- Processing: The full stored event history is converted into a text file.
- Output: A `.txt` file containing the simulation event history is downloaded.

## Notes

- The visual event log is capped for display performance, but the downloaded event log stores the full event history for the current run.
- The simulation combines direct user input with internally generated events and data structures to model ride dispatch behavior over time.
