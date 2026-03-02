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
            if (currRider === "WAITING")
            {
            let currDriver = this.DriverList.head;
            let currDist;
            let bestDist = Infinity;
            let bestDriver = null;
            while(currDriver !== null)
            {
                currDist = this.findDistance(currDriver.data, currRider.data);
                if (currDist < bestDist && currDriver.data.state == "AVAILABLE")
                {
                    bestDist = currDist;
                    bestDriver = currDriver.data;
                }
                currDriver = currDriver.next;
            }
            if (bestDriver !== null)
                this.assignDriver(currRider.data, bestDriver);
        }
            currRider = currRider.next;
        }
    }

    assignDriver(rider, driver)
    {
        driver.state = "BUSY";
        driver.assignedRider = rider;
        rider.assignedDriver = driver;
        rider.state = "MATCHED";
    }

    findDistance(driver, rider)
    {
        let xDist = abs(driver.location.x - rider.location.x);
        let yDist = abs(driver.location.y - rider.location.y);
        let dist = Math.sqrt((xDist ** 2) + (yDist ** 2));
        return(dist);
    }

}