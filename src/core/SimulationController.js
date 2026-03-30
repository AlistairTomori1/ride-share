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
        this.dispatchEngine = new DispatchEngine(this.driverList, this.riderList);
        this.time = 0;
        //normal sim speed is 100
        this.simSpeed = 100;
        this.pause = 1;
    }

    addDriver(driver)
    {
        this.driverList.addLink(driver);
    }
    addRider(rider)
    {
        this.riderList.addLink(rider);
        this.dispatchEngine.matchDriverToSingle(rider);
    }
    
    tick()
    {
        this.time++;
        this.dispatchEngine.update();
        this.moveDrivers();
        this.moveRiders();
    }
    
    runSim()
    {
        if (this.pause == 1)
            this.tick();
        else
            return;
    }

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
            if (curr.state == "PICKED UP")
                curr.location = curr.assignedDriver.location;

            if (curr.state == "DROPPED OFF")
                this.riderList.remove(curr);

            curr = curr.next;
        }
    }
}
