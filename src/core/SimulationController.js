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
    }
    
    runSim()
    {
        this.tick();
    }

    moveDrivers()
    {
        let curr = this.driverList.head;
        while (curr !== null)
        {
            if (curr.data.state == "PICKING UP")
            {
            if (curr.data.location[0] !== curr.data.assignedRider.location[0])
                curr.data.location[0] += Math.sign(curr.data.assignedRider.location[0] - curr.data.location[0]) * 1;
            else if (curr.data.location[1] !== curr.data.assignedRider.location[1])
                curr.data.location[1] += Math.sign(curr.data.assignedRider.location[1] - curr.data.location[1]) * 1;
            else
            {
                curr.data.assignedRider.state = "PICKED UP";
                curr.data.state = "DROPPING OFF";
            }
            }

            if (curr.data.state == "DROPPING OFF")
            {
            if (curr.data.location[0] !== curr.data.assignedRider.dropOff[0])
                curr.data.location[0] += Math.sign(curr.data.assignedRider.dropOff[0] - curr.data.location[0]) * 1;
            else if (curr.data.location[1] !== curr.data.assignedRider.dropOff[1])
                curr.data.location[1] += Math.sign(curr.data.assignedRider.dropOff[1] - curr.data.location[1]) * 1;
            else
            {
                curr.data.state = "AVAILABLE";
                curr.data.assignedRider.state = "DROPPED OFF";
            }
        }
            curr = curr.next;
    }
}
}