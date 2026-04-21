# I/O History

This document explains the main inputs and outputs in our ride-share dispatch simulation.

## Purpose

In our project, input does not only mean button presses. Some inputs come from the user, and some are generated internally by the simulation itself. This document shows both, along with the outputs the system produces.

## User Inputs

| Input | Type | What It Does |
| --- | --- | --- |
| Pause | Button | Starts or stops the live simulation. |
| Speed controls | Buttons | Changes simulation speed to `0.5X`, `1X`, `2X`, or `10X`. |
| Surge | Button | Instantly adds 10 new ride requests. |
| Text only mode | Toggle button | Turns off the map rendering and keeps the text interface. |
| Grid size | Buttons | Changes the grid size to `5`, `10`, `20`, `40`, or `80`. |
| Driver count | Prompt/input | Resets the simulation with a chosen number of drivers. |
| Target busy ratio | Buttons | Changes the rider spawn target to `50%`, `65%`, `85%`, `100%`, or `120%`. |
| Main tabs | Buttons | Switches between `Driver/Rider List`, `Events`, `Settings`, and `Stats`. |
| List sub-tabs | Buttons | Filters the list view between `All`, `Drivers`, `Riders`, and `Expired`. |
| Run Batch | Button + input | Runs the simulation for a selected number of simulated hours without normal rendering. |
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

## Example I/O Scenarios

### 1. Live Control

- **Input:** The user clicks `Pause`.
- **Processing:** The simulation loop stops updating time and movement.
- **Output:** The scene stays visible, but drivers and riders stop changing until the sim is resumed.

### 2. New Rider Request

- **Input:** The spawn controller creates a new rider.
- **Processing:** The rider is added to the correct linked list and matched to a driver if possible.
- **Output:** The rider appears on the map and in the list, and an event may be added to the log.

### 3. Speed Change

- **Input:** The user clicks `2X` or `10X`.
- **Processing:** The speed multiplier changes.
- **Output:** The simulation clock advances faster, and the sim processes updates more quickly.

### 4. Batch Run

- **Input:** The user clicks `Run Batch` and enters a number of hours.
- **Processing:** The simulation runs without normal map rendering until the target time is reached.
- **Output:** The end-of-simulation screen appears with final stats and an event-log download button.

### 5. Event Log Download

- **Input:** The user clicks `Download Event Log`.
- **Processing:** The full stored event history is converted into a text file.
- **Output:** A `.txt` file containing the simulation event history is downloaded.

## Notes

- The visible event log is capped for display performance.
- The downloaded event log still contains the full event history for the run.
- Our simulation combines direct user input with internally generated events and linked-list updates to model dispatch behavior over time.
