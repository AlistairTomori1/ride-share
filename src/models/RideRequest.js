class RideRequest
{
    constructor(id, location, passengers, amenitiesRequired = [])
    {
        this.id = id;
        this.location = location;
        this.passengers = passengers;
        this.amenitiesRequired = amenitiesRequired;
        this.requestTime = millis();
        this.state = "WAITING";
        this.assignedDriver = null;
        this.waitTimer = 10;
    }
}