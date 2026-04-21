# AI Usage Log

This document records how AI assistance was used during development of the ride-share dispatch simulation project.

## Summary of AI Use

1. **Initial project setup**
   - AI suggested a starting file structure for organizing the project.
   - The final structure was reviewed and adapted during development.

2. **UI scrolling improvements**
   - AI helped update the UI so the driver and rider lists could be scrolled when they became too long to fit on screen.
   - These changes improved usability of the visualization panel.

3. **Pause and speed controls**
   - AI helped generate the UI buttons for pausing the simulation and changing simulation speed.
   - The actual simulation behavior and control logic were implemented and integrated by us.

4. **Driver movement bug**
   - AI helped diagnose and fix a difficult bug in `SimulationController` where a driver could jitter on top of a pickup location.
   - This support was used for debugging and stabilization of the simulation.

5. **Time complexity support**
   - AI reviewed the project structure and helped identify the time complexity of key functions.
   - This information was then used to complete the complexity analysis document.

6. **Rider spawn bug with small grid sizes**
   - AI helped troubleshoot a bug in `spawnRider()` where ride requests could spawn incorrectly when the grid size was changed to `5` or `10`.
   - AI suggested using a `do { } while ()` loop to repeatedly generate positions until a valid location was found.

7. **Documentation formatting**
   - AI helped improve the formatting and presentation of project documentation files.
   - This included support with organizing the daily log, AI usage log, project plan, I/O history, and README links so the submission documents were clearer and more professional.

## Notes

- AI was used mainly for debugging help, UI support, and documentation support.
- Core project logic was reviewed and integrated into the codebase with human decisions and modifications.
