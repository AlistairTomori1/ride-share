# AI Usage Log

We used AI as a support tool during development of this project. We mainly used it for UI help, debugging difficult issues, and improving the formatting of our documentation. We did not use it to generate our custom linked list implementation, `Node` class, or the core dispatch algorithm without review and modification.

## Where We Used AI

1. **Starting project structure**
   - We used AI early on to suggest a starting file structure for the project.
   - We then changed that structure as the project grew.

2. **UI and display fixes**
   - We used AI to help with interface improvements, especially for the right-side panel.
   - This included scrollable list/event views and some of the UI button layout.

3. **Pause and speed controls**
   - AI helped with some of the button code for pausing the simulation and changing simulation speed.
   - We still implemented the actual simulation behavior and connected those controls ourselves.

4. **Driver movement bug**
   - We used AI while debugging a movement issue in `SimulationController` where drivers could jitter at pickup points.
   - We used the suggestions to help track down and fix the logic.

5. **Time complexity support**
   - We used AI to help review the project and identify the time complexity of key functions.
   - We then checked those functions against our own code and used that information in the complexity document.

6. **Spawn bug at small grid sizes**
   - We used AI to help solve a bug in `spawnRider()` where ride requests could spawn incorrectly when the grid size was changed to `5` or `10`.
   - One useful suggestion was using a `do { } while ()` loop to keep generating positions until a valid one was found.

7. **Documentation formatting**
   - We used AI to help clean up and format our project documentation.
   - This included the daily log, AI usage log, project plan, I/O history, README, and other submission documents.

## Notes

- We used AI mainly as a debugging and documentation support tool.
- All AI suggestions were reviewed and adjusted before being kept in the project.
- Core project decisions, code integration, and final structure were still done by us.
