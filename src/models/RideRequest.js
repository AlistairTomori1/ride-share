const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();
export default class RideRequest
{
    constructor(id, location, passengers, amenitiesRequired = [])
    {
        this.id = id;
        this.location = location;
        this.passengers = passengers;
        this.amenitiesRequired = amenitiesRequired;
        this.requestTime = `${hours}:${minutes}:${seconds}`
        this.state = "WAITING";
        this.assignedDriver = null;
        this.waitTimer = 10;
    }
}