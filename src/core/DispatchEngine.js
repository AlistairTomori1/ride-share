import Scoring from "../utils/Scoring.js";
import LinkedList from "../data/LinkedList.js";
import Event from "../models/Event.js";
import ExpiredList from "../models/ExpiredList.js";
export default class DispatchEngine
{
    constructor(DriverList, RiderList, priorityList, eventLog)
    {
        this.DriverList = DriverList;
        this.RiderList = RiderList;
        this.priorityList = priorityList;
        this.eventLog = eventLog;
        this.expiredList = new LinkedList();
        this.scoring = new Scoring();
        this.totalProfits = 0;
        this.surgeMultiplier = 1;
        this.expireCount = 0;
        this.availableCount = 0;
        this.waitingCount = 0;
    }

    update(speedMultiplier = 1)
    {
        this.updateWaitingRiders(speedMultiplier);
        //this.updateBusyDrivers();
        //this.matchDriversToRides();
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
        {
            rider.cost = bestScore;
            this.assignDriver(rider, bestDriver);

        }
        return;
    }

    matchRiderToSingle(driver)
    {
        let currRider = this.priorityList.head;
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
        {
            bestRider.cost = bestScore;
            this.assignDriver(bestRider, driver);
            return;
        }

        currRider = this.RiderList.head;
        bestScore = Infinity;
        bestRider = null;
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
        {
            bestRider.cost = bestScore;
            this.assignDriver(bestRider, driver);
        }
        return;
    }

    assignDriver(rider, driver)
    {
        driver.state = "PICKING UP";
        this.availableCount--;
        this.waitingCount--;
        driver.assignedRider = rider;
        rider.assignedDriver = driver;
        rider.state = "MATCHED";
        driver.busyTimer = 5;
        let event = new Event("Driver " + driver.id + " has been assigned to rider " + rider.id);
        this.eventLog.addLink(event);
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

    updateWaitingRiders(speedMultiplier = 1)
    {
        let curr = this.RiderList.head;

        while (curr !== null)
        {
            let rider = curr;

            if (rider.state === "WAITING" && rider.assignedDriver === null)
            {
                rider.waitTimer -= speedMultiplier;

                if (rider.waitTimer <= 0)
                {
                    rider.state = "EXPIRED";
                    this.trackExpiredRider(rider);
                    this.waitingCount--;
                    let event = new Event("Rider " + rider.id + " has been expired");
                    this.eventLog.addLink(event);
                    this.expireCount++;
                }
            }
            curr = curr.next;
        }

        curr = this.priorityList.head;

        while (curr !== null)
        {
            let rider = curr;

            if (rider.state === "WAITING" && rider.assignedDriver === null)
            {
                rider.waitTimer -= speedMultiplier;

                if (rider.waitTimer <= 0)
                {
                    rider.state = "EXPIRED";
                    this.trackExpiredRider(rider);
                    this.waitingCount--;
                    let event = new Event("Rider " + rider.id + " has been expired");
                    this.eventLog.addLink(event);
                    this.expireCount++;
                }
            }
            curr = curr.next;
        }
    }

    calculateProfit(rider)
    {
        let baseProfit = Math.floor(rider.cost / 10);
        return Math.max(1, Math.floor(baseProfit * this.surgeMultiplier));
    }

    trackExpiredRider(rider)
    {
        this.expiredList.addLink(new ExpiredList(rider));
        if (this.expiredList.size > 200)
            this.expiredList.remove(this.expiredList.head);
    }

}
