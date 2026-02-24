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
        let curr = this.DriverList.head;
        while(curr !== null)
        {
            this.assignDriver(curr);
        }
    }

    assignDriver()
    {

    }

}