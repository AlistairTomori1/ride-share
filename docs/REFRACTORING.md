# Refactoring Log

This file tracks the refactoring and performance-related improvements we made while the project was growing.

## Main Refactors

1. Reworked the spawn-controller logic so rider spawning could aim toward a target busy-driver ratio instead of using a simple fixed pattern.
2. Reworked the spawn controller again so it uses smoothed utilization, completion rate, queue pressure, and Poisson-style arrivals instead of bursty fixed accumulation.
3. Added live cached counters such as `availableCount` and `waitingCount` so the simulation did not need to count through linked lists every frame.
4. Virtualized stats text rendering so only visible rows are drawn instead of every row in the panel.
5. Added caps to rolling logs and lists so the visible event log and expired rider list stay manageable during longer runs.
6. Updated simulation time handling so timing stays consistent when the speed multiplier changes.
7. Updated rider expiration timing so request countdowns follow actual simulated seconds in both live mode and batch mode.
8. Changed surge to use waiting demand instead of counting riders already in progress.
9. Added wait-time weighting to scoring so older riders are more likely to be matched.
10. Added text-only mode so rendering work can be skipped when testing larger loads.
11. Added a downloadable event log so the full event history can still be reviewed after long runs.
12. Added instant/batch simulation runs to test the system over longer periods without waiting in real time.
13. Added the stats tab so we could track average wait time, average ride time, expired rides per hour, busy-driver percentage, total rides, and total earnings.
14. Added high-speed summary charts at `30X` and `60X` so we can inspect large runs without rendering the full map.
15. Added driver POV mode to inspect one driver in detail with a HUD and assignment notifications.
16. Reorganized and cleaned up `sketch.js` so the main UI and simulation code was easier to navigate and maintain.

## Why These Refactors Mattered

The main goal of these changes was not just cleanup. We used them to make the simulation easier to test, easier to explain, and more stable under larger loads. Most of our refactoring work was focused on reducing unnecessary repeated work, improving visibility into the simulation, and making the project easier to present as a Level 4 submission.
