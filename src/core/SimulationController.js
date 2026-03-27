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

    moveDrivers()
    {
        let curr = this.driverList.head;
        let speed = this.simSpeed/50;
        while (curr !== null)
        {
            if (curr.state == "PICKING UP")
            {
            if (curr.location[0] !== curr.assignedRider.location[0])
            {
                curr.location[0] += Math.sign(curr.assignedRider.location[0] - curr.location[0]) * speed;
                if (curr.location[0] > curr.assignedRider.location[0])
                    curr.rotation = (3 * Math.PI/2);
                else
                    curr.rotation = (Math.PI/2);
            }
            else if (curr.location[1] !== curr.assignedRider.location[1])
            {
                curr.location[1] += Math.sign(curr.assignedRider.location[1] - curr.location[1]) * speed;
                if (curr.location[1] > curr.assignedRider.location[1])
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
            if (curr.location[0] !== curr.assignedRider.dropOff[0])
            {
                curr.location[0] += Math.sign(curr.assignedRider.dropOff[0] - curr.location[0]) * speed;
                if (curr.location[0] > curr.assignedRider.dropOff[0])
                    curr.rotation = (3 * Math.PI/2);
                else
                    curr.rotation = Math.PI/2;
            }
            else if (curr.location[1] !== curr.assignedRider.dropOff[1])
            {
                curr.location[1] += Math.sign(curr.assignedRider.dropOff[1] - curr.location[1]) * speed;
                if (curr.location[1] > curr.assignedRider.dropOff[1])
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
