class RideRequest
{
    constructor(id, location)
    {
        this.id = id;
        this.location = location;
        this.state = "WAITING";
        this.assignedDriver = null;
    }
}