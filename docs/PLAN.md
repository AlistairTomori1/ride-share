# Project Plan

## Course and Project Context

**Course:** ICS4U - Data Structures and Algorithms  
**Project:** Ride-Share Dispatch Simulation using Linked Lists  
**Partners:** Alistair T. and James W.

**Checkpoint Schedule**
- Checkpoint 1: Wednesday, March 25 at 12:10 PM
- Checkpoint 2: Friday, April 10 at 12:50 PM
- Checkpoint 3: Thursday, April 23 at 12:45 PM

## Project Goal

The goal of this project is to build a ride-share dispatch simulation that uses custom linked lists as the primary data structure for storing and updating dynamic simulation data. The project is designed to demonstrate data structure implementation, algorithmic matching logic, simulation modeling, object-oriented programming, time complexity analysis, and professional software development practices.

This project is not a game and is not primarily a UI project. The visualization exists to show the linked-list-based simulation in motion. The core of the project is the correctness of the data structures, dispatch logic, state transitions, and event tracking.

## Final Target

This project is being developed to meet **Level 4 - Inferno** expectations.

### Level 4 Focus

- Medium data set support, including large driver and rider loads
- Surge-based advanced behavior
- Professional GitHub workflow with issues, pull requests, and project tracking
- Performance comparison and refactoring discussion
- Clear analysis of limitations, scaling tradeoffs, and design decisions

## Core System Requirements

The final system is planned to demonstrate the following:

- Custom `Node` and `LinkedList` implementations
- Dynamic linked lists for drivers, ride requests, expired riders, and event history
- Composite dispatch scoring using distance, capacity, and amenities
- Manhattan distance calculations
- Driver state transitions through the ride lifecycle
- Request expiration handling
- Structured event logging using a linked list
- Real-time visualization in the browser
- Adjustable simulation speed
- Text-only and batch-run modes for larger simulation runs
- Statistics collection and analysis

## Implemented Feature Plan

### 1. Data Structures

The project is built around linked-list-based storage and traversal.

Planned and implemented structures:
- `Node`
- `LinkedList`
- Driver list
- Rider list
- Priority rider list
- Expired rider list
- Event log list

These structures support insertions, removals, traversal, and state updates during the simulation.

### 2. Dispatch and Matching Logic

The dispatch system is designed to simulate how a ride-share platform matches riders to drivers.

Planned and implemented logic:
- Match riders and drivers using a composite score
- Use Manhattan distance as the distance metric
- Include passenger count and amenity requirements in scoring
- Maintain driver availability and state transitions
- Assign, pick up, transport, and drop off riders
- Expire unmatched requests

### 3. Simulation Features

The simulation layer is intended to model the system over time rather than only compute isolated matches.

Planned and implemented simulation features:
- Real-time simulation loop
- Driver movement on a grid
- Ride request spawning
- Configurable simulation speed
- Pause and resume controls
- Real simulated date/time clock
- Surge button for demand spikes
- Adjustable target busy ratio for rider spawning behavior

### 4. Visualization and Interface

The interface is used to inspect system state and support testing.

Planned and implemented interface features:
- Visual map with drivers and riders
- Driver/rider list panel
- Event log tab
- Settings tab
- Stats tab
- List sub-tabs for filtered views
- Scrollable text panels
- Text-only mode
- Batch-run end screen
- Downloadable full event log

### 5. Statistics and Analysis

The project includes statistics to support performance review and reflection.

Planned and implemented metrics:
- Average wait time
- Average ride time
- Expired rides per hour
- Average percent of busy drivers
- Total rides completed
- Total earnings

### 6. Large-Load Support

To support Level 4 expectations, the project includes planning and implementation for larger simulation sizes.

Planned large-load support:
- Text-only mode to remove render overhead
- Batch simulation mode for long simulation runs
- Virtualized stats/event rendering
- Cached counters for available and waiting entities
- Event log caps for visual performance
- Refactoring for simpler and more efficient update paths

## Phase Breakdown

## Phase 1: Core Architecture

**Focus**
- Build the linked-list foundation
- Define the simulation models
- establish the class relationships and UML

**Primary Deliverables**
- `Node` and `LinkedList`
- Driver and rider model classes
- UML diagram
- Initial algorithm plan

## Phase 2: Matching Engine

**Focus**
- Build dispatch scoring
- handle driver state transitions
- add request expiration and event logging

**Primary Deliverables**
- Composite matching logic
- Expiration handling
- Event log
- Big-O analysis

## Phase 3: Full Simulation

**Focus**
- Connect the dispatch system to a live simulation
- visualize the data structures and state changes
- improve interactivity and debugging visibility

**Primary Deliverables**
- Browser-based visualization
- Adjustable speed controls
- Driver and rider movement
- Visual inspection of matches, expirations, and events

## Phase 4: Level 4 Expansion and Submission Polish

**Focus**
- Extend the project beyond the base requirements
- support larger simulation sizes
- strengthen documentation and workflow evidence

**Primary Deliverables**
- Surge logic
- Batch mode and text-only mode
- Stats and downloadable event log
- GitHub issue / PR workflow evidence
- Refactoring and performance discussion
- Final submission documents

## Team Responsibilities

## Alistair

Primary focus areas:
- System architecture
- Dispatch and simulation logic
- Scoring design
- Performance improvements
- Statistics and analysis
- Documentation and submission organization

## James

Primary focus areas:
- UML and design support
- Linked-list implementation support
- Visualization support
- Class modeling support
- Testing and project documentation contributions

## Shared Responsibilities

- Debugging and validation
- Feature testing
- GitHub workflow
- Daily logs
- Submission preparation

## GitHub Workflow

The project uses GitHub as part of the development process.

Planned workflow:
- Use issues to track tasks and feature work
- Use pull requests for major changes
- Use a shared GitHub Project board to organize progress
- Maintain meaningful commit history
- Keep supporting documents in the repository for submission evidence

This supports the course expectation of using professional development practices and collaborative tools.

## Success Criteria

The final project should clearly show:

- Correct custom linked-list implementation
- Correct dispatch and state-transition logic
- Event logging using a linked list
- Time-based request expiration
- Manhattan-distance-based ride dispatch
- Modular object-oriented code organization
- Real-time simulation and visualization
- Adjustable speed and control features
- Clear time complexity analysis
- Professional documentation and AI transparency
- Level 4 features, including surge behavior, large-load support, and GitHub workflow evidence

## Final Submission Checklist

The final submission should include:

- Complete working simulation
- Source code repository link
- Daily logs
- Project plan
- I/O history
- UML
- AI usage log
- Time complexity analysis
- Reflection on limitations and future improvements

## Project Reflection Direction

The final reflection should explain:

- what data structures and algorithms were most important
- where linked lists worked well
- where performance limitations appeared under large loads
- what optimizations and refactors improved scalability
- how the project demonstrates Level 4 expectations
