import Node from "../data/Node.js";
export default class RideRequest extends Node
{
    constructor(id, location, passengers, amenitiesRequired = [], dropOff, priority, spawnTime)
    {
        super(id, location, "RIDER")
        this.dropOff = dropOff;
        this.passengers = passengers;
        this.amenitiesRequired = amenitiesRequired;
        this.state = "WAITING";
        this.assignedDriver = null;
        this.waitTimer = 600;
        this.initialWaitTimer = this.waitTimer;
        this.priority = priority;
        this.cost;
        this.spawnTime = spawnTime;
        this.pickupTime = null;
    }
}
