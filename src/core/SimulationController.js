class SimulationController
{
    constructor()
    {
        this.driverList = new LinkedList();
        this.riderList = new LinkedList();
        this.dispatchEngine = new DispatchEngine(this.driverList, this.riderList);
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
        this.dispatchEngine.update();
    }
    
    runSim()
    {
        this.tick();
    }
}