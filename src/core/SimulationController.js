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
        console.log(this.driverList);
        this.time = 0;
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
    }
    
    tick()
    {
        this.time++;
        console.log("tick");
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
            if (curr.data.state == "PICKING UP")
            {
            if (curr.data.location[0] !== curr.data.assignedRider.location[0])
            {
                curr.data.location[0] += Math.sign(curr.data.assignedRider.location[0] - curr.data.location[0]) * speed;
                if (curr.data.location[0] > curr.data.assignedRider.location[0])
                    curr.data.rotation = (3 * Math.PI/2);
                else
                    curr.data.rotation = (Math.PI/2);
            }
            else if (curr.data.location[1] !== curr.data.assignedRider.location[1])
            {
                curr.data.location[1] += Math.sign(curr.data.assignedRider.location[1] - curr.data.location[1]) * speed;
                if (curr.data.location[1] > curr.data.assignedRider.location[1])
                    curr.data.rotation = 0;
                else
                    curr.data.rotation = Math.PI;
            }
            else
            {
                curr.data.assignedRider.state = "PICKED UP";
                curr.data.state = "DROPPING OFF";
            }
            }

            if (curr.data.state == "DROPPING OFF")
            {
            if (curr.data.location[0] !== curr.data.assignedRider.dropOff[0])
            {
                curr.data.location[0] += Math.sign(curr.data.assignedRider.dropOff[0] - curr.data.location[0]) * speed;
                if (curr.data.location[0] > curr.data.assignedRider.dropOff[0])
                    curr.data.rotation = (3 * Math.PI/2);
                else
                    curr.data.rotation = Math.PI/2;
            }
            else if (curr.data.location[1] !== curr.data.assignedRider.dropOff[1])
            {
                curr.data.location[1] += Math.sign(curr.data.assignedRider.dropOff[1] - curr.data.location[1]) * speed;
                if (curr.data.location[1] > curr.data.assignedRider.dropOff[1])
                    curr.data.rotation = 0;
                else
                    curr.data.rotation = Math.PI;
            }
            else
            {
                curr.data.state = "AVAILABLE";
                curr.data.assignedRider.state = "DROPPED OFF";
                curr.data.rotation = 0;
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
            if (curr.data.state == "PICKED UP")
                curr.data.location = curr.data.assignedDriver.location;

            if (curr.data.state == "DROPPED OFF")
                this.riderList.remove(curr.data);

            curr = curr.next;
        }
    }
}