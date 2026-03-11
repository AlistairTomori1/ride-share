export default class Driver {
    constructor(id, location, capacity, amenities = [])
    {
        this.id = id;
        this.location = location;
        this.capacity = capacity;
        this.amenities = amenities;
        this.state = "AVAILABLE";
        this.assignedRider = null;
        this.busyTimer = 0;
        this.rotation = 0;
}
}