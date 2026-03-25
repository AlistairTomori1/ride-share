Goal: each frame, expire old requests, match waiting riders, move trips, and clean finished riders.

Data:
drivers = linked list of Driver
riders = linked list of RideRequest
eventLog = list of messages
time = 0, simSpeed = 100

Driver:
id, location[x,y], capacity, amenities[], state, assignedRider, rotation, profits
states = AVAILABLE, PICKING_UP, DROPPING_OFF

Rider:
id, location[x,y], dropOff[x,y], passengers, amenitiesRequired[], state, assignedDriver, waitTimer
states = WAITING, MATCHED, PICKED_UP, DROPPED_OFF, EXPIRED

FUNCTION RUN_FRAME()
    TICK()
    DRAW_SCENE()

FUNCTION TICK()
    time = time + 1
    UPDATE_WAITING_RIDERS()
    MATCH_DRIVERS_TO_RIDERS()
    MOVE_DRIVERS()
    MOVE_RIDERS()

FUNCTION UPDATE_WAITING_RIDERS()
    FOR each rider in riders
        IF rider.state == WAITING AND rider.assignedDriver == null
            rider.waitTimer = rider.waitTimer - 1
            IF rider.waitTimer <= 0
                rider.state = EXPIRED
                eventLog.add("Rider expired: " + rider.id)

FUNCTION MATCH_DRIVERS_TO_RIDERS()
    FOR each rider in riders
        IF rider.state != WAITING
            CONTINUE
        bestDriver = null
        bestScore = Infinity
        FOR each driver in drivers
            IF driver.state != AVAILABLE
                CONTINUE
            score = CALCULATE_SCORE(driver, rider)
            IF score < bestScore
                bestScore = score
                bestDriver = driver
        IF bestDriver != null
            ASSIGN_DRIVER(bestDriver, rider)

FUNCTION CALCULATE_SCORE(driver, rider)
    IF driver.capacity < rider.passengers
        RETURN Infinity
    FOR each amenity in rider.amenitiesRequired
        IF amenity not in driver.amenities
            RETURN Infinity
    dx = ABS(driver.location.x - rider.location.x)
    dy = ABS(driver.location.y - rider.location.y)
    RETURN SQRT(dx*dx + dy*dy) + 2

FUNCTION ASSIGN_DRIVER(driver, rider)
    driver.state = PICKING_UP
    driver.assignedRider = rider
    rider.assignedDriver = driver
    rider.state = MATCHED
    driver.profits = driver.profits + FLOOR(DISTANCE(driver.location, rider.location) / 10)
    eventLog.add("Assigned driver " + driver.id + " to rider " + rider.id)

FUNCTION MOVE_DRIVERS()
    speed = simSpeed / 50
    FOR each driver in drivers
        IF driver.state == PICKING_UP
            MOVE_TOWARD(driver.location, driver.assignedRider.location, speed)
            IF driver.location == driver.assignedRider.location
                driver.assignedRider.state = PICKED_UP
                driver.state = DROPPING_OFF
                eventLog.add("Pickup complete for rider " + driver.assignedRider.id)
        ELSE IF driver.state == DROPPING_OFF
            MOVE_TOWARD(driver.location, driver.assignedRider.dropOff, speed)
            IF driver.location == driver.assignedRider.dropOff
                driver.assignedRider.state = DROPPED_OFF
                driver.state = AVAILABLE
                driver.rotation = 0
                eventLog.add("Dropoff complete for rider " + driver.assignedRider.id)

FUNCTION MOVE_RIDERS()
    FOR each rider in riders
        IF rider.state == PICKED_UP
            rider.location = rider.assignedDriver.location
        IF rider.state == DROPPED_OFF OR rider.state == EXPIRED
            remove rider from riders

FUNCTION MOVE_TOWARD(current, target, speed)
    Move in x direction until x matches target.x, then in y direction until y matches target.y.
    Update rotation to face movement direction.
