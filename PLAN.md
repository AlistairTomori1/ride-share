Phase 1 – Core Architecture (Checkpoint 1)

Objective:
Implement and test Node and LinkedList classes.
Define Driver and RideRequest models.
Demonstrate two functioning linked lists.

Alistair Responsibilities:
	•	Finalize UML in DESIGN_DOC.md
	•	Design matching algorithm pseudocode
	•	Create DispatchEngine class skeleton
	•	Define composite scoring framework
	•	Assist with LinkedList edge case testing

James Responsibilities:
	•	Implement Node class
	•	Implement LinkedList class:
	•	insert()
	•	remove()
	•	search()
	•	traverse()
	•	size()
	•	Test LinkedList functionality independently (console testing)
	•	Implement Driver class
	•	Implement RideRequest class
	•	Implement Event class

Shared:
	•	Validate LinkedList correctness
	•	Test two independent linked lists (drivers and requests)
	•	Create basic console-based simulation (no visualization yet)

Deliverable:
Working data structures + UML + algorithm plan.

⸻

Phase 2 – Matching Engine (Checkpoint 2)

Objective:
Implement composite scoring algorithm.
Implement driver state transitions.
Implement request expiration.
Implement event logging system.
Analyze time complexity.

Alistair Responsibilities:
	•	Implement DispatchEngine.matchDriversToRequests()
	•	Implement calculateScore() with:
	•	distance factor
	•	capacity factor
	•	amenity prioritization
	•	Design and document scoring weights
	•	Write Big-O analysis in TIME_COMPLEXITY.md
	•	Analyze tradeoffs of LinkedList vs Array

James Responsibilities:
	•	Implement driver state transitions:
AVAILABLE -> EN_ROUTE -> OCCUPIED -> AVAILABLE
	•	Implement request expiration logic
	•	Implement event logging LinkedList
	•	Ensure events are logged for:
	•	match
	•	expiration
	•	state changes

Shared:
	•	Test matching logic in console
	•	Verify expired requests are removed
	•	Validate event log traversal

Deliverable:
Fully functional console-based dispatch system with event tracking and documented time complexity.

⸻

Phase 3 – Full Simulation (Checkpoint 3)

Objective:
Integrate real-time visualization using P5.js.
Add adjustable simulation speed.
Display drivers, requests, matches, and expired rides visually.

James Responsibilities:
	•	Implement sketch.js rendering logic
	•	Draw drivers (color-coded by state)
	•	Draw ride requests
	•	Draw match connections
	•	Implement adjustable simulation speed control
	•	Visual feedback for expired requests

Alistair Responsibilities:
	•	Integrate DispatchEngine with SimulationController
	•	Ensure logic and rendering remain separated
	•	Optimize when matching runs (avoid unnecessary recomputation)
	•	Finalize complexity discussion
	•	Write reflection on limitations and scalability

Shared:
	•	System integration testing
	•	Debug simulation behavior
	•	Prepare final submission documentation
	•	Maintain AI usage log

Deliverable:
Complete real-time simulation demonstrating Level 3 features.

⸻

GitHub Workflow

Branches:
	•	main – stable milestones only
	•	dev – active development
	•	feature branches as needed:
	•	feature/linkedlist
	•	feature/matching-engine
	•	feature/visualization

Requirements:
	•	Minimum 15 meaningful commits
	•	Clear commit messages
	•	Pull requests for major merges
	•	Both partners review code before merging to main

⸻

Division of Complexity

Alistair:
	•	Algorithm design
	•	Scoring logic
	•	Time complexity analysis
	•	System architecture decisions

James:
	•	LinkedList implementation
	•	Driver and request state handling
	•	Full visualization system
	•	Event log implementation

Workload is balanced by:
	•	Complexity (algorithm vs implementation)
	•	Code volume (visualization is substantial)
	•	Documentation responsibilities

⸻

Success Criteria for Level 3
	•	Custom LinkedList fully functional
	•	Composite scoring implemented
	•	Amenities influence matching
	•	Driver state lifecycle handled
	•	Request expiration working
	•	Event log maintained using LinkedList
	•	Adjustable simulation speed
	•	Big-O complexity discussion included
