# Project Plan

## Course and Project Context

**Course:** ICS4U - Data Structures and Algorithms  
**Project:** Ride-Share Dispatch Simulation using Linked Lists  
**Partners:** Alistair T. and James W.

**Checkpoint Schedule**
- Checkpoint 1: Wednesday, March 25 at 12:10 PM
- Checkpoint 2: Friday, April 10 at 12:50 PM
- Checkpoint 3: Thursday, April 23 at 12:45 PM

## Goal

Our goal for this project was to build a ride-share dispatch simulation that uses custom linked lists as the main data structure. We wanted the project to show more than just a working visualization. The important part was building a system that could manage drivers, rider requests, state transitions, expiration, matching, and event tracking in a structured way.

We also planned the project with Level 4 in mind, so we aimed to go beyond the base requirements by adding larger-load support, surge behavior, stronger documentation, and a more professional GitHub workflow.

## Level 4 Target

We built this project toward **Level 4 - Inferno**.

### What that meant for us

- support larger driver and rider counts
- include advanced behavior through surge logic
- use GitHub issues, pull requests, and project tracking
- document refactoring and performance tradeoffs
- show that we thought about scaling, not just correctness

## What the Final System Needed to Include

By the end of the project, our plan was for the system to include:

- custom `Node` and `LinkedList` classes
- linked lists for drivers and ride requests
- composite dispatch scoring
- Manhattan distance calculations
- driver state transitions
- request expiration
- event logging with a linked list
- browser-based visualization
- adjustable simulation speed
- documentation, analysis, and submission evidence

## Main Parts of the Project

### 1. Data Structures

Our project is built around linked lists.

We planned to use linked lists for:
- drivers
- riders
- priority riders
- expired riders
- visible event log

This let us keep insertion and removal efficient while still meeting the assignment focus on custom data structures.

### 2. Dispatch Logic

The dispatch side of the project was planned around matching riders to the best driver instead of assigning randomly.

Main dispatch goals:
- scan available drivers for a new rider
- scan waiting riders when a driver becomes free
- score matches using distance, capacity, and amenities
- reject impossible matches using `Infinity`
- keep driver and rider state changes consistent

### 3. Simulation Layer

The project also needed to behave like a real simulation over time.

Main simulation goals:
- continuously spawn riders
- move drivers on the grid
- pick up and drop off riders
- expire riders if they wait too long
- track time and update statistics

### 4. Interface and Testing Support

Even though this was not mainly a UI project, we still needed an interface that made the system easy to inspect.

Main interface goals:
- show drivers and riders visually
- show text-based lists
- show event history
- support pausing and speed changes
- support text-only and batch-run modes for larger tests
- show summary stats clearly

## Phase Breakdown

### Phase 1: Core Architecture

**Focus**
- build the linked-list foundation
- define the main simulation classes
- create the UML and algorithm plan

**Deliverables**
- `Node`
- `LinkedList`
- driver and rider model classes
- class design and UML
- early dispatch structure

### Phase 2: Matching Engine

**Focus**
- implement matching logic
- add expiration and event tracking
- connect rider/driver state changes

**Deliverables**
- composite scoring
- expiration handling
- event log
- initial time complexity work

### Phase 3: Full Simulation

**Focus**
- connect the logic to a live browser simulation
- add movement and interface controls
- make the system easy to test visually

**Deliverables**
- real-time simulation loop
- driver movement
- rider movement
- adjustable speed
- pause controls
- visible lists and event log

### Phase 4: Level 4 Expansion and Submission Prep

**Focus**
- improve scaling
- add advanced features
- clean up the code and documentation

**Deliverables**
- surge logic
- stats tab
- text-only mode
- batch simulation mode
- downloadable event log
- refactoring notes
- submission documents

## Team Responsibilities

### Alistair

Main responsibilities:
- system architecture
- dispatch and simulation logic
- scoring design
- performance improvements
- stats and batch mode features
- final documentation organization

### James

Main responsibilities:
- UML and design support
- class modeling support
- linked-list support
- visualization support
- testing and documentation contributions

## Shared Responsibilities

- testing and debugging
- GitHub workflow
- daily development tracking
- preparing final submission files

## GitHub Workflow

We used GitHub as part of the development process rather than only as a final upload location.

Our workflow included:
- tracking work with issues
- using pull requests for larger changes
- using a GitHub Project board to organize tasks
- keeping a visible commit history
- keeping submission documents in the repo

## Success Criteria

We considered the project successful if it clearly showed:

- a working custom linked-list structure
- correct matching and state transitions
- event logging through linked lists
- request expiration
- Manhattan-distance-based dispatch
- modular class structure
- a working simulation and visualization
- adjustable controls and statistics
- clear documentation and AI transparency
- Level 4 features and evidence

## Final Submission Checklist

Our final submission needs to include:

- complete working simulation
- repository link
- daily logs
- project plan
- I/O history
- UML
- AI usage log
- time complexity analysis
- reflection on limitations and future improvements

## Reflection Direction

When we write the final reflection, we want it to explain:

- which data structures mattered most in the project
- where linked lists worked well
- where performance problems started to show up
- what changes improved the simulation
- what we would still improve if we had more time
- how the finished project meets Level 4 expectations
