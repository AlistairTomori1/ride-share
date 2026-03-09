import Scoring from "../utils/Scoring.js";
import LinkedList from "../data/LinkedList.js";
import SimulationController from "./SimulationController.js";
export default class DispatchEngine
{
    constructor(DriverList, RiderList)
    {
        this.DriverList = DriverList;
        this.RiderList = RiderList;
        this.eventLog = new LinkedList();
        this.scoring = new Scoring();
    }

    update()
    {
        //this.updateWaitingRiders();
        //this.updateBusyDrivers();
        this.matchDriversToRides();
    }

    matchDriversToRides()
    {
        let currRider = this.RiderList.head;
        while(currRider !== null)
        {
            if (currRider.data.state === "WAITING")
            {
            let currDriver = this.DriverList.head;
            let currScore;
            let bestScore = Infinity;
            let bestDriver = null;
            while(currDriver !== null)
            {
                currScore = this.scoring.calculateScore(currDriver.data, currRider.data);
                if (currScore < bestScore && currDriver.data.state == "AVAILABLE")
                {
                    bestScore = currScore;
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
        driver.state = "PICKING UP";
        driver.assignedRider = rider;
        rider.assignedDriver = driver;
        rider.state = "MATCHED";
        driver.busyTimer = 5;
        console.log(rider.assignedDriver.id + ", " + driver.assignedRider.id)
    }
    updateBusyDrivers()
    {
        let curr = this.DriverList.head;

        while (curr !== null)
        {
            let driver = curr.data;

            if (driver.state === "PICKING UP")
            {
                driver.busyTimer--;

                if (driver.busyTimer <= 0)
                {
                    driver.state = "AVAILABLE";
                    driver.assignedRider = null;
                }  
            }
            curr = curr.next;
        }
    }

    updateWaitingRiders()
    {
        let curr = this.RiderList.head;
        let prev = null;

        while (curr !== null)
        {
            let rider = curr.data;

            if (rider.state === "WAITING")
            {
                rider.waitTimer--;

                if (rider.waitTimer <= 0)
                {
                    rider.state = "EXPIRED";

                    if (prev === null)
                    {
                        this.RiderList.head = curr.next;
                        curr = this.RiderList.head;
                    }
                    else
                    {
                        prev.next = curr.next;
                        curr = prev.next;
                    }

                    continue;
                }
            }
            prev = curr;
            curr = curr.next;
        }
    }

}