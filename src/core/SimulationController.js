import DispatchEngine from "./DispatchEngine.js";
import LinkedList from "../data/LinkedList.js";
import Driver from "../models/Driver.js";
import Rider from "../models/RideRequest.js";
import Event from "../models/Event.js"
export default class SimulationController
{
    constructor()
    {
        this.loggingEnabled = true;
        this.driverList = new LinkedList();
        this.riderList = new LinkedList();
        this.eventLog = new LinkedList();
        this.priorityList = new LinkedList();
        this.time = 0;
        this.startDate = new Date(2026, 0, 1, 0, 0, 0, 0);
        this.dispatchEngine = new DispatchEngine(
            this.driverList,
            this.riderList,
            this.priorityList,
            this.eventLog,
            () => this.getFormattedSimTime(),
            () => this.loggingEnabled
        );
        //normal sim speed is 100
        this.simSpeed = 100;
        this.baseSimSpeed = this.simSpeed;
        this.pause = 1;
        this.averageWaitTime = 0;
        this.averageWaitTimeCount = 0;
        this.totalWaitTime = 0;
        this.averageExpiredPerHour = 0;
        this.averageRideTime = 0;
        this.averageRideTimeCount = 0;
        this.totalRideTime = 0;
        this.busyRatioTimeTotal = 0;
        this.averageBusy = 0;
        this.cachedFormattedSimTime = "";
        this.cachedFormattedMinute = -1;
    }

    getSimDate()
    {
        return new Date(this.startDate.getTime() + this.time * 1000);
    }

    getFormattedSimTime()
    {
        const currentMinute = Math.floor(this.time / 60);
        if (currentMinute !== this.cachedFormattedMinute)
        {
            this.cachedFormattedMinute = currentMinute;
            this.cachedFormattedSimTime = this.getSimDate().toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });
        }
        return this.cachedFormattedSimTime;
    }

    addDriver(driver)
    {
        this.driverList.addLink(driver);
        this.dispatchEngine.availableCount++;
    }
    addRider(rider)
    {
        this.dispatchEngine.waitingCount++;
        if (rider.priority == true)
        {
            this.priorityList.addLink(rider);
            this.dispatchEngine.matchDriverToSingle(rider);
        }
        else
        {
            this.riderList.addLink(rider);
            this.dispatchEngine.matchDriverToSingle(rider);
        }
    }
    tick(deltaSeconds)
    {
        const speedMultiplier = this.simSpeed / this.baseSimSpeed;
        const clockSeconds = deltaSeconds * speedMultiplier * 60;
        this.time += clockSeconds;
        this.dispatchEngine.update(speedMultiplier);
        this.moveDrivers(deltaSeconds);
        this.moveRiders();
        this.updateSurge();
        this.expireOldEvents();

        let simHoursElapsed = this.time / 3600;
        this.averageExpiredPerHour = simHoursElapsed > 0 ? this.dispatchEngine.expireCount / simHoursElapsed : 0;

        let totalDrivers = this.driverList.size;
        let busyDrivers = totalDrivers - this.dispatchEngine.availableCount;
        let busyRatio = totalDrivers > 0 ? busyDrivers / totalDrivers : 0;
        this.busyRatioTimeTotal += busyRatio * clockSeconds;
        this.averageBusy = this.time > 0 ? (this.busyRatioTimeTotal / this.time) * 100 : 0;

    }
    
    runSim(deltaSeconds)
    {
        if (this.pause == 1)
            this.tick(deltaSeconds);
    }
    //AI implemented 
    moveValueTowards(current, target, step)
    {
        const delta = target - current;
        if (Math.abs(delta) <= step)
            return target;
        return current + Math.sign(delta) * step;
    }

    isAtTarget(current, target)
    {
        return Math.abs(current - target) < 0.0001;
    }
    //AI implementaion end ^
    moveDrivers(deltaSeconds)
    {
        let curr = this.driverList.head;
        let speed = (this.simSpeed/50) * deltaSeconds * 60;
        while (curr !== null)
        {
            if (curr.state == "PICKING UP")
            {
                const pickupX = curr.assignedRider.location[0];
                const pickupY = curr.assignedRider.location[1];
                const xDelta = pickupX - curr.location[0];
                const yDelta = pickupY - curr.location[1];

                if (!this.isAtTarget(curr.location[0], pickupX))
                {
                    curr.location[0] = this.moveValueTowards(curr.location[0], pickupX, speed);
                    if (xDelta < 0)
                        curr.rotation = (3 * Math.PI/2);
                    else
                        curr.rotation = (Math.PI/2);
                }
                else if (!this.isAtTarget(curr.location[1], pickupY))
                {
                    curr.location[1] = this.moveValueTowards(curr.location[1], pickupY, speed);
                    if (yDelta < 0)
                        curr.rotation = 0;
                    else
                        curr.rotation = Math.PI;
                }
                else
                {
                    curr.assignedRider.state = "PICKED UP";
                    curr.state = "DROPPING OFF";
                    let waitMinutes = (this.getSimDate() - curr.assignedRider.spawnTime) / 60000;
                    curr.assignedRider.pickupTime = this.getSimDate();
                    this.totalWaitTime += waitMinutes;
                    this.averageWaitTimeCount++;
                    this.averageWaitTime = this.totalWaitTime / this.averageWaitTimeCount;

                    if (this.loggingEnabled)
                    {
                        let event = new Event(curr, curr.assignedRider, "pickup", null, this.getFormattedSimTime(), waitMinutes);
                        this.dispatchEngine.eventLog.addLink(event);

                    }
                }
            }

            if (curr.state == "DROPPING OFF")
            {
                const dropOffX = curr.assignedRider.dropOff[0];
                const dropOffY = curr.assignedRider.dropOff[1];
                const xDelta = dropOffX - curr.location[0];
                const yDelta = dropOffY - curr.location[1];

                if (!this.isAtTarget(curr.location[0], dropOffX))
                {
                    curr.location[0] = this.moveValueTowards(curr.location[0], dropOffX, speed);
                    if (xDelta < 0)
                        curr.rotation = (3 * Math.PI/2);
                    else
                        curr.rotation = Math.PI/2;
                }
                else if (!this.isAtTarget(curr.location[1], dropOffY))
                {
                    curr.location[1] = this.moveValueTowards(curr.location[1], dropOffY, speed);
                    if (yDelta < 0)
                        curr.rotation = 0;
                    else
                        curr.rotation = Math.PI;
                }
                else
                {
                    let droppedRider = curr.assignedRider;
                    if (droppedRider !== null)
                    {
                        droppedRider.state = "DROPPED OFF";
                        droppedRider.assignedDriver = null;

                        let RideMinutes = (this.getSimDate() - curr.assignedRider.pickupTime) / 60000;
                        this.totalRideTime += RideMinutes;
                        this.averageRideTimeCount++;
                        this.averageRideTime = this.totalRideTime / this.averageRideTimeCount;

                        if (this.loggingEnabled)
                        {
                            let event = new Event(curr, droppedRider, "dropoff", null, this.getFormattedSimTime(), RideMinutes);
                            this.dispatchEngine.eventLog.addLink(event);

                        }

                        let tripProfit = this.dispatchEngine.calculateProfit(droppedRider);
                        curr.profits += tripProfit;
                        this.dispatchEngine.totalProfits += tripProfit;
                    }
                    curr.assignedRider = null;
                    this.dispatchEngine.availableCount++;
                    curr.state = "AVAILABLE";
                    curr.rotation = 0;
                    this.dispatchEngine.matchRiderToSingle(curr);
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
            let next = curr.next;

            if (curr.state == "PICKED UP")
                curr.location = curr.assignedDriver.location;

            if (curr.state == "DROPPED OFF")
                this.riderList.remove(curr);

            curr = next;
        }

        curr = this.priorityList.head;

        while (curr !== null)
        {
            let next = curr.next;

            if (curr.state == "PICKED UP")
                curr.location = curr.assignedDriver.location;

            if (curr.state == "DROPPED OFF")
                this.priorityList.remove(curr);

            curr = next;
        }
    }

    updateSurge()
    {
        let ratio = (this.riderList.size + this.priorityList.size) / Math.max(1, this.driverList.size);
        let raw = 1 + 0.25 * (ratio - 1);
        let nextSurge = Math.max(1, Math.min(3, Math.round(raw * 4) / 4));

        if (nextSurge !== this.dispatchEngine.surgeMultiplier)
        {
            this.dispatchEngine.surgeMultiplier = nextSurge;

            if (this.loggingEnabled)
            {
                let event = new Event(null, null, "surge", this.dispatchEngine.surgeMultiplier.toFixed(2), this.getFormattedSimTime());
                this.dispatchEngine.eventLog.addLink(event);

            }
        }
    }

    expireOldEvents()
    {
        while(this.dispatchEngine.eventLog.size > 200)
            this.dispatchEngine.eventLog.remove(this.dispatchEngine.eventLog.head);
    }
}
