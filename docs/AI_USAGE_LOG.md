# AI Usage Log

We used AI as a support tool during development of this project. We mainly used it for UI help, debugging, some simulation helpers, and cleaning up documentation. We did not use it to generate our custom `LinkedList` class, `Node` class, or the base dispatch structure without review and modification.

## Where We Used AI

1. **Starting project structure**
   - We used AI early on to suggest a starting file structure for the project.
   - We then changed that structure as the project grew and split more logic into separate files.

2. **UI and display setup**
   - We used AI for parts of the canvas setup, draw-loop structure, and some of the right-side panel layout.
   - This also included some of the scrollable panel behavior and layout cleanup in `sketch.js`.

3. **Pause and speed controls**
   - AI helped with some of the button code for pausing the simulation and changing simulation speed.
   - We still connected those controls into our own simulation logic.

4. **Downloadable event log**
   - We used AI to help wire the browser download logic for the full event log text file.
   - This mainly covered creating the `Blob`, object URL, and download link flow.

5. **Batch simulation run**
   - We used AI to help with the structure for the instant/batch simulation runner.
   - This included the chunked loop used to keep the page responsive while running a long simulation quickly.

6. **Driver POV mode**
   - We used AI to help implement the driver POV feature.
   - This included the camera-follow transform, POV HUD layout, wrapped amenities text, and short assignment notifications.

7. **High-speed summary mode**
   - We used AI to help with the high-speed chart mode at `30X` and `60X`.
   - This included the summary bar charts and the average values shown beside each bar.

8. **Simulation time formatting**
   - We used AI for the formatted date/time display helper used by the simulation clock and event log output.
   - We reviewed and kept the final formatting logic ourselves.

9. **Movement helpers**
   - We used AI for the small helper functions that move values toward a target and check if a driver has reached a target point.
   - These helpers were then used inside our driver movement logic.

10. **Surge calculation**
    - We used AI to help shape the surge multiplier logic.
    - We later adjusted it so it depends on waiting demand instead of riders already in progress.

11. **Wait-time scoring**
    - We used AI to help add a wait-time score bonus so riders who have waited longer are more likely to be assigned.
    - We then tuned the formula against the rest of our scoring system.

12. **Spawn-controller tuning and refactoring**
    - We used AI multiple times while rebuilding the spawn controller.
    - This included smoothing logic, randomized arrivals, realistic mode, and later moving the spawn controller into its own file.
    - We still tested and tuned the actual numbers ourselves after seeing the simulation results.

13. **Spawn bug at small grid sizes**
    - We used AI to help solve a bug in `spawnRider()` where ride requests could spawn incorrectly when the grid size was changed to `5` or `10`.
    - One useful suggestion was using a `do { } while ()` loop to keep generating positions until a valid one was found.

14. **Driver movement bug**
    - We used AI while debugging a movement issue in `SimulationController` where drivers could jitter at pickup points.
    - We used the suggestions to help track down and fix the logic.

15. **Time complexity support**
    - We used AI to help review the project and identify the time complexity of key functions.
    - We then checked those functions against our own code and used that information in the complexity document.

16. **Documentation formatting**
    - We used AI to help clean up and format our project documentation.
    - This included the README, project plan, I/O history, reflection, time complexity writeup, refactoring notes, and some formatting work in the daily log and AI usage log.

## Notes

- We used AI mainly as a support tool for debugging, UI work, simulation helpers, and documentation.
- All AI suggestions were reviewed, tested, and often adjusted before being kept in the project.
- Core project decisions, code integration, and final tuning were still done by us.
