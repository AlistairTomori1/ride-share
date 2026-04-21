# Refactoring Log

This file tracks the refactoring and performance-related improvements we made while the project was growing.

## Main Refactors

1. Reworked the spawn-controller logic so rider spawning could aim toward a target busy-driver ratio instead of using a simple fixed pattern.
2. Added live cached counters such as `availableCount` and `waitingCount` so the simulation did not need to count through linked lists every frame.
3. Virtualized stats text rendering so only visible rows are drawn instead of every row in the panel.
4. Added caps to rolling logs and lists so the visible event log and expired rider list stay manageable during longer runs.
5. Updated simulation time handling so timing stays consistent when the speed multiplier changes.
6. Updated rider expiration timing so request countdowns follow simulation time instead of only frame timing.
7. Added text-only mode so rendering work can be skipped when testing larger loads.
8. Added a downloadable event log so the full event history can still be reviewed after long runs.
9. Added instant/batch simulation runs to test the system over longer periods without waiting in real time.
10. Added the stats tab so we could track average wait time, average ride time, expired rides per hour, busy-driver percentage, total rides, and total earnings.
11. Added adjustable controls for simulation speed, grid size, driver count, and target busy percentage.
12. Reorganized and cleaned up `sketch.js` so the main UI and simulation code was easier to navigate and maintain.

## Why These Refactors Mattered

The main goal of these changes was not just cleanup. We used them to make the simulation easier to test, easier to explain, and more stable under larger loads. Most of our refactoring work was focused on reducing unnecessary repeated work, improving visibility into the simulation, and making the project easier to present as a Level 4 submission.
