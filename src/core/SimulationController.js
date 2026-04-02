import DispatchEngine from "./DispatchEngine.js";
import LinkedList from "../data/LinkedList.js";
import Driver from "../models/Driver.js";
import Rider from "../models/RideRequest.js";
export default class SimulationController
{
    constructor()
    {
        this.driverList = new LinkedList();
        this.riderList = new LinkedList();
        this.priorityList = new LinkedList();
        this.dispatchEngine = new DispatchEngine(this.driverList, this.riderList, this.priorityList);
        this.time = 0;
        //normal sim speed is 100
        this.simSpeed = 100;
        this.baseSimSpeed = this.simSpeed;
        this.pause = 1;
    }

    addDriver(driver)
    {
        this.driverList.addLink(driver);
    }
    addRider(rider)
    {
        if (rider.priority == true)
        {
            this.priorityList.addLink(rider);
            this.dispatchEngine.matchDriverToSingle(rider);
        }
        else
        {
            this.riderList.addLink(rider);
            this.dispatchEngine.matchDriverToSingle(rider);
        }
    }
    tick()
    {
        this.time++;
        const speedMultiplier = this.simSpeed / this.baseSimSpeed;
        this.dispatchEngine.update(speedMultiplier);
        this.moveDrivers();
        this.moveRiders();
        this.updateSurge();
    }
    
    runSim()
    {
        if (this.pause == 1)
            this.tick();
        else
            return;
    }
    //AI implemented 
    moveValueTowards(current, target, step)
    {
        const delta = target - current;
        if (Math.abs(delta) <= step)
            return target;
        return current + Math.sign(delta) * step;
    }

    isAtTarget(current, target)
    {
        return Math.abs(current - target) < 0.0001;
    }
    //AI implementaion end ^
    moveDrivers()
    {
        let curr = this.driverList.head;
        let speed = this.simSpeed/50;
        while (curr !== null)
        {
            if (curr.state == "PICKING UP")
            {
                const pickupX = curr.assignedRider.location[0];
                const pickupY = curr.assignedRider.location[1];
                const xDelta = pickupX - curr.location[0];
                const yDelta = pickupY - curr.location[1];

                if (!this.isAtTarget(curr.location[0], pickupX))
                {
                    curr.location[0] = this.moveValueTowards(curr.location[0], pickupX, speed);
                    if (xDelta < 0)
                        curr.rotation = (3 * Math.PI/2);
                    else
                        curr.rotation = (Math.PI/2);
                }
                else if (!this.isAtTarget(curr.location[1], pickupY))
                {
                    curr.location[1] = this.moveValueTowards(curr.location[1], pickupY, speed);
                    if (yDelta < 0)
                        curr.rotation = 0;
                    else
                        curr.rotation = Math.PI;
                }
                else
                {
                    curr.assignedRider.state = "PICKED UP";
                    curr.state = "DROPPING OFF";
                    this.dispatchEngine.eventLog.addEvent("Driver " + curr.id + " has picked up rider " + curr.assignedRider.id)
                }
            }

            if (curr.state == "DROPPING OFF")
            {
                const dropOffX = curr.assignedRider.dropOff[0];
                const dropOffY = curr.assignedRider.dropOff[1];
                const xDelta = dropOffX - curr.location[0];
                const yDelta = dropOffY - curr.location[1];

                if (!this.isAtTarget(curr.location[0], dropOffX))
                {
                    curr.location[0] = this.moveValueTowards(curr.location[0], dropOffX, speed);
                    if (xDelta < 0)
                        curr.rotation = (3 * Math.PI/2);
                    else
                        curr.rotation = Math.PI/2;
                }
                else if (!this.isAtTarget(curr.location[1], dropOffY))
                {
                    curr.location[1] = this.moveValueTowards(curr.location[1], dropOffY, speed);
                    if (yDelta < 0)
                        curr.rotation = 0;
                    else
                        curr.rotation = Math.PI;
                }
                else
                {
                    let droppedRider = curr.assignedRider;
                    if (droppedRider !== null)
                    {
                        droppedRider.state = "DROPPED OFF";
                        droppedRider.assignedDriver = null;
                        this.dispatchEngine.eventLog.addEvent("Driver " + curr.id + " has dropped off rider " + droppedRider.id)
                    }
                    curr.assignedRider = null;
                    curr.state = "AVAILABLE";
                    curr.rotation = 0;
                    this.dispatchEngine.matchRiderToSingle(curr);
                }
            }
            curr = curr.next;
        }
    }

    moveRiders()
    {
        let curr = this.riderList.head;

        while (curr !== null)
        {
            let next = curr.next;

            if (curr.state == "PICKED UP")
                curr.location = curr.assignedDriver.location;

            if (curr.state == "DROPPED OFF")
                this.riderList.remove(curr);

            curr = next;
        }

        curr = this.priorityList.head;

        while (curr !== null)
        {
            let next = curr.next;

            if (curr.state == "PICKED UP")
                curr.location = curr.assignedDriver.location;

            if (curr.state == "DROPPED OFF")
                this.priorityList.remove(curr);

            curr = next;
        }
    }

    updateSurge()
    {
        let ratio = (this.riderList.size + this.priorityList.size) / Math.max(1, this.driverList.size);
        let raw = 1 + 0.25 * (ratio - 1);
        let nextSurge = Math.max(1, Math.min(3, Math.round(raw * 4) / 4));

        if (nextSurge !== this.dispatchEngine.surgeMultiplier)
        {
            this.dispatchEngine.surgeMultiplier = nextSurge;
            this.dispatchEngine.eventLog.addEvent("Surge updated to " + this.dispatchEngine.surgeMultiplier.toFixed(2) + "x");
        }
    }
}
