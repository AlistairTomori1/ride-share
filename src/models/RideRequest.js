import Node from "../data/Node.js";
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();
export default class RideRequest extends Node
{
    constructor(id, location, passengers, amenitiesRequired = [], dropOff, priority)
    {
        super(id, location, "RIDER")
        this.dropOff = dropOff;
        this.passengers = passengers;
        this.amenitiesRequired = amenitiesRequired;
        this.requestTime = `${hours}:${minutes}:${seconds}`
        this.state = "WAITING";
        this.assignedDriver = null;
        this.waitTimer = 600;
        this.priority = priority;
        this.cost;
    }
}