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
    }
    
    runSim()
    {
        this.tick();
    }
}