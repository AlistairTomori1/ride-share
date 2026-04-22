# Reflection

## Overview

Looking back at this project, we think the biggest part of the learning was seeing how much harder a simulation becomes once everything has to keep updating over time. At the start, it seemed like the main challenge would just be building a linked list and then matching drivers to riders. Once we actually started building the full system, we realized that the harder part was keeping all the moving pieces consistent at the same time: driver states, rider states, expiration, event logging, movement, simulation speed, and statistics.

We also learned that this project was much more about system design than just writing individual functions. A lot of the work ended up being about deciding where different pieces of logic should live, how classes should interact, and how to keep the code understandable as more features were added.

## What Went Well

One part of the project that went well was the overall structure. Separating the project into `LinkedList`, `DispatchEngine`, `SimulationController`, model classes, and `sketch.js` made it easier to keep expanding the system without everything collapsing into one file. That separation became more important as we added Level 4 features like text-only mode, batch runs, stats, and the downloadable event log.

Another part that went well was building around linked lists the whole way through instead of treating them like a small requirement at the beginning. We used linked lists for the driver list, rider list, priority rider list, expired rider list, and visible event log. That helped keep the project aligned with the actual goal of the assignment.

We also think the simulation became much stronger once we added better debugging visibility. Features like the event log, the stats tab, text-only mode, batch simulation, high-speed chart mode, and driver POV made it much easier to test the system and understand what it was doing. Those tools made it possible to tune and improve the simulation, rather than just being visual features.

## Challenges We Ran Into

The biggest challenge was performance and scaling. Once we started increasing the number of drivers and riders, problems were showing up. Matching drivers to riders and riders back to drivers still depends on scanning through full linked lists, so large runs exposed the cost of that design. That forced us to think more carefully about when matching should run, how much rendering was costing, and what needed to be optimized first.

Another challenge was tuning the spawn controller. At first we just spawned riders as a fixed rate. However, we soon found out it was not enough. It might look fine for one driver count and then behave completely differently when the number of drivers changes. We spent a lot of time adjusting the spawn logic so the system could aim for an average busy ratio over time instead of only looking acceptable in one small test case. The final version ended up using smoothed utilization, completion rate, queue pressure, and randomized arrivals to make the request flow look more natural.

We also had to deal with bugs that only appeared at higher speed or larger scale. For example, movement bugs, rider cleanup bugs, and event-log issues were much harder to notice in small runs than in fast or large ones. That taught us that a simulation can appear correct under normal conditions but still break under stress.

## What We Learned About Data Structures and Algorithms

This project made the strengths and limits of linked lists much clearer. Linked lists worked well for insertions, removals, and maintaining ordered event/history structures. They were especially useful for things like removing expired or dropped-off riders once the node was known.

At the same time, this project also showed us that linked lists do not automatically make a system fast. The real bottleneck in our project is not insertion or removal. It is the repeated full-list scanning used by the dispatch algorithm. That was a useful lesson because it made the time complexity analysis feel more practical and useable.

We also learned that algorithm design decisions matter more as the project gets larger. A system that feels fine at 10 drivers can behave very differently at 25 or 100. That was one of the biggest differences between just “making it work” and trying to build something that actually fits the Level 4 expectations.

## Level 4 Features and Growth

We aimed to make the project a Level 4 submission, and we think the strongest parts of that are the features that go beyond the basic simulation loop.

Those include:
- surge logic
- text-only mode
- batch-run mode
- driver POV mode
- high-speed summary mode at `30X` and `60X`
- statistics tracking
- downloadable full event log
- GitHub issues, pull requests, and project tracking
- refactoring and performance discussion

More importantly, we think the Level 4 part is more determained by the fact that we spent time thinking about scaling, workflow, testing, and tradeoffs. We had to move from building the simulation to also analyzing how well it works, where it breaks down, and what kind of changes improve it.

## Limitations

The main limitation of our current system is still matching performance. Because matching is based on scanning through drivers or riders, the algorithm gets slower as the active lists grow. Text-only mode and batch mode help with rendering overhead, but they do not remove the actual matching cost.

Another limitation is that the spawn controller is still a tuned controller rather than a perfect model of real ride-share demand. It works much better than a fixed spawn interval, but it still depends on tuning values and does not represent all the complexity of a real dispatch system.

The visualization is also mainly a support tool. It is useful for testing and presenting the simulation, but once the system grows large enough, the visual side stops being the best way to inspect behavior. That is why the text-only mode, batch mode, and stats became important additions.

## What We Would Improve Next

If we had more time, the next improvement would be changing the matching strategy so it does not need full-list scans as often. Some kind of spatial grouping or a more advanced priority structure would probably be the next real scaling improvement.

We would also improve the reflection and performance-comparison side by doing more formal benchmark runs across several driver counts and recording the results more systematically. We tested and tuned the system a lot, but a more structured benchmark section would make the analysis stronger.

Another improvement would be making the simulation data easier to inspect after large runs, especially for long batch tests. The current stats and event-log export help, but more summary reporting would make it easier to compare runs directly.

## Final Thoughts

Overall, we think this project was a good example of how data structures, algorithms, simulation logic, and software development practices all connect. The final system is much more complete than what we started with, and the biggest progress was from learning how to organize the system, debug it under stress, and improve it in ways that make it realistic.

The final version shows the linked-list requirement clearly, as well as the bigger ideas behind the course: modular design, algorithm analysis, performance tradeoffs, and iterative improvement. That is what we think makes the project a very good final submission.
