import Node from "../data/Node.js";
export default class Driver extends Node{
    constructor(id, location, capacity, amenities = [])
    {
        super(id, location, "DRIVER");
        this.capacity = capacity;
        this.amenities = amenities;
        this.state = "AVAILABLE";
        this.assignedRider = null;
        this.busyTimer = 0;
        this.rotation = 0;
        this.profits = 0;
        this.tripCount = 0;
}
}
