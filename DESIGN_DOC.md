Class: Node
	•	data
	•	next

Class: LinkedList
	•	head
	•	insert(data)
	•	remove(data)
	•	search(id)
	•	traverse()
	•	size()

Class: Driver
	•	id
	•	location
	•	capacity
	•	amenities
	•	state
	•	assignedRequest

Class: RideRequest
	•	id
	•	pickupLocation
	•	passengers
	•	requiredAmenities
	•	timeCreated
	•	expirationTime
	•	status

Class: Event
	•	timestamp
	•	type
	•	description

Class: DispatchEngine
	•	matchDriversToRequests()
	•	calculateScore(driver, request)
	•	assignDriver()
	•	expireRequests()

Class: SimulationController
	•	driverList
	•	requestList
	•	eventLog
	•	update()
	•	spawnRequest()