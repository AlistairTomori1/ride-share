# Project Plan

This document outlines the original project plan, task division, workflow, and success criteria for the ride-share dispatch simulation.

## Phase 1: Core Architecture

**Checkpoint:** Checkpoint 1

**Objective**
- Implement and test the `Node` and `LinkedList` classes.
- Define the `Driver` and `RideRequest` models.
- Demonstrate two functioning linked lists.

**Alistair Responsibilities**
- Finalize the UML in `DESIGN_DOC.md`
- Design matching algorithm pseudocode
- Create the `DispatchEngine` class skeleton
- Define the composite scoring framework
- Assist with `LinkedList` edge-case testing

**James Responsibilities**
- Implement the `Node` class
- Implement the `LinkedList` class
- Implement `insert()`
- Implement `remove()`
- Implement `search()`
- Implement `traverse()`
- Implement `size()`
- Test `LinkedList` functionality independently with console testing
- Implement the `Driver` class
- Implement the `RideRequest` class
- Implement the `Event` class

**Shared Tasks**
- Validate `LinkedList` correctness
- Test two independent linked lists for drivers and ride requests
- Create a basic console-based simulation before visualization

**Deliverable**
- Working data structures, UML, and algorithm plan

## Phase 2: Matching Engine

**Checkpoint:** Checkpoint 2

**Objective**
- Implement the composite scoring algorithm
- Implement driver state transitions
- Implement request expiration
- Implement the event logging system
- Analyze time complexity

**Alistair Responsibilities**
- Implement `DispatchEngine.matchDriversToRequests()`
- Implement `calculateScore()` with:
  - distance factor
  - capacity factor
  - amenity prioritization
- Design and document scoring weights
- Write Big-O analysis in `TIME_COMPLEXITY.md`
- Analyze tradeoffs of `LinkedList` vs. array-based approaches

**James Responsibilities**
- Implement driver state transitions:
  - `AVAILABLE -> EN_ROUTE -> OCCUPIED -> AVAILABLE`
- Implement request expiration logic
- Implement the event logging `LinkedList`
- Ensure events are logged for:
  - matches
  - expirations
  - state changes

**Shared Tasks**
- Test matching logic in the console
- Verify expired requests are removed correctly
- Validate event log traversal

**Deliverable**
- Fully functional console-based dispatch system with event tracking and documented time complexity

## Phase 3: Full Simulation

**Checkpoint:** Checkpoint 3

**Objective**
- Integrate real-time visualization using `p5.js`
- Add adjustable simulation speed
- Display drivers, requests, matches, and expired rides visually

**James Responsibilities**
- Implement `sketch.js` rendering logic
- Draw drivers with state-based coloring
- Draw ride requests
- Draw match connections
- Implement adjustable simulation speed control
- Add visual feedback for expired requests

**Alistair Responsibilities**
- Integrate `DispatchEngine` with `SimulationController`
- Ensure logic and rendering remain separated
- Optimize when matching runs to avoid unnecessary recomputation
- Finalize the complexity discussion
- Write the reflection on limitations and scalability

**Shared Tasks**
- Perform system integration testing
- Debug simulation behavior
- Prepare final submission documentation
- Maintain the AI usage log

**Deliverable**
- Complete real-time simulation demonstrating Level 3 features

## GitHub Workflow

**Branches**
- `main`: stable milestones only
- `dev`: active development
- feature branches as needed:
  - `feature/linkedlist`
  - `feature/matching-engine`
  - `feature/visualization`

**Requirements**
- Minimum of 15 meaningful commits
- Clear commit messages
- Pull requests for major merges
- Both partners review code before merging to `main`

## Division of Complexity

**Alistair**
- Algorithm design
- Scoring logic
- Time complexity analysis
- System architecture decisions

**James**
- `LinkedList` implementation
- Driver and request state handling
- Full visualization system
- Event log implementation

**Workload Balance**
- Complexity balance: algorithm design vs. implementation
- Code volume balance: visualization work is substantial
- Shared documentation responsibilities

## Success Criteria for Level 3

- Custom `LinkedList` fully functional
- Composite scoring implemented
- Amenities influence matching
- Driver state lifecycle handled
- Request expiration working
- Event log maintained using a `LinkedList`
- Adjustable simulation speed
- Big-O complexity discussion included
