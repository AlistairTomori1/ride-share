class DispatchEngine
{
    constructor(DriverList, RiderList)
    {
        this.DriverList = DriverList;
        this.RiderList = RiderList;
    }

    update()
    {
        this.matchDriversToRides();
    }

    matchDriversToRides()
    {
        let currRider = this.RiderList.head;
        while(currRider !== null)
        {
            let currDriver = this.DriverList.head;
            let currDist;
            let bestDist = Infinity;
            let bestDriver = null;
            while(currDriver !== null)
            {
                currDist = this.findDistance(currDriver.data, currRider.data);
                if (currDist < bestDist)
                {
                    bestDist = currDist;
                    bestDriver = currDriver;
                }
                currDriver = currDriver.nextl;
            }
            this.assignDriver(currRider, bestDriver);
            currRider = currRider.next;
        }
    }

    assignDriver(rider, driver)
    {

    }

    findDistance(driver, rider)
    {
        let xDist = abs(driver.location.x - rider.location.x);
        let yDist = abs(driver.location.y - rider.location.y);
        let dist = Math.sqrt((xDist ** 2) + (yDist ** 2));
        return(dist);
    }

}