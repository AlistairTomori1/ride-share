# Refactoring Log

1. Reworked spawn-controller rate logic toward target utilization (roughly 85% busy) to reduce persistent rider backlog and expiration under larger fleets.
2. Added/validated live counters (`availableCount`, `waitingCount`) so the sim avoids full linked-list counting passes each frame.
3. Virtualized stats text rendering so only visible rows are drawn instead of the entire list every frame.
4. Added bounded caps for rolling logs/lists (event history and expired riders) so memory and traversal cost stay stable over long runs.
5. Updated simulation time progression to scale by speed multiplier so timing systems remain consistent at higher sim speeds.
6. Updated rider expiration countdown to run in simulation time, preventing mismatch between displayed speed and lifecycle timing.
7. Added text-only mode so heavy rendering work can be skipped for large-load performance testing.
8. added downloadable event log.
9. added instant sim run.
10. added stats tab to see average wait time, average ride time, expired rides per hour, average percent of busy drivers, total rides done, total earnings. 
11. added adjustable inputes like: speed, grid size, driver count, target busy percent.
12. Made the spawn controller more accurate