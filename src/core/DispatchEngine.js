import Scoring from "../utils/Scoring.js";
import LinkedList from "../data/LinkedList.js";
import EventLog from "../models/Event.js";
export default class DispatchEngine
{
    constructor(DriverList, RiderList)
    {
        this.DriverList = DriverList;
        this.RiderList = RiderList;
        this.eventLog = new EventLog();
        this.scoring = new Scoring();
        this.totalProfits = 0;
    }

    update()
    {
        this.updateWaitingRiders();
        //this.updateBusyDrivers();
        //this.matchDriversToRides();
    }

    matchDriversToRides()
    {
        let currRider = this.RiderList.head;
        while(currRider !== null)
        {
            if (currRider.state === "WAITING")
            {
            let currDriver = this.DriverList.head;
            let currScore;
            let bestScore = Infinity;
            let bestDriver = null;
            while(currDriver !== null)
            {
                if (currDriver.state == "AVAILABLE")
                {
                currScore = this.scoring.calculateScore(currDriver, currRider);
                if (currScore < bestScore)
                {
                    bestScore = currScore;
                    bestDriver = currDriver;
                }
            }
                currDriver = currDriver.next;
            }
            if (bestDriver !== null)
                this.assignDriver(currRider, bestDriver);
        }
            currRider = currRider.next;
        }
    }

    matchDriverToSingle(rider)
    {
        let currDriver = this.DriverList.head;
        let currScore;
        let bestScore = Infinity;
        let bestDriver = null;
        while (currDriver !== null)
        {
            if (currDriver.state == "AVAILABLE")
            {
                currScore = this.scoring.calculateScore(currDriver, rider);
                if (currScore < bestScore)
                {
                    bestScore = currScore;
                    bestDriver = currDriver;
                }
            }
            currDriver = currDriver.next;
        }
        if (bestDriver !== null)
            this.assignDriver(rider, bestDriver);
        return;
    }

        matchRiderToSingle(driver)
    {
        let currRider = this.RiderList.head;
        let currScore;
        let bestScore = Infinity;
        let bestRider = null;
        while (currRider !== null)
        {
            if (currRider.state == "WAITING")
            {
                currScore = this.scoring.calculateScore(driver, currRider);
                if (currScore < bestScore)
                {
                    bestScore = currScore;
                    bestRider = currRider;
                }
            }
            currRider = currRider.next;
        }
        if (bestRider !== null)
            this.assignDriver(bestRider, driver);
        return;
    }

    assignDriver(rider, driver)
    {
        driver.state = "PICKING UP";
        driver.assignedRider = rider;
        rider.assignedDriver = driver;
        rider.state = "MATCHED";
        driver.busyTimer = 5;
        driver.profits += this.calculateProfit(rider);
        this.totalProfits += this.calculateProfit(rider);
        this.eventLog.addEvent("Driver " + driver.id + " has been assigned to rider " + rider.id);
    }
    updateBusyDrivers()
    {
        let curr = this.DriverList.head;

        while (curr !== null)
        {
            let driver = curr;

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

        while (curr !== null)
        {
            let rider = curr;

            if (rider.state === "WAITING" && rider.assignedDriver === null)
            {
                rider.waitTimer--;

                if (rider.waitTimer <= 0)
                {
                    rider.state = "EXPIRED";
                    this.eventLog.addEvent("Rider " + rider.id + " has been expired");
                }
            }
            curr = curr.next;
        }
    }

    calculateProfit(rider)
    {
        
        return(Math.floor(this.scoring.scoreDistance(rider.assignedDriver, rider) / 10));
    }

}