export default class SpawnController
{
    constructor()
    {
        this.reset();
    }

    reset(simulation = null)
    {
        this.rideRate = 0;
        this.spawnRate = 0;
        this.lastRideCount = simulation ? simulation.dispatchEngine.rideAmount : 0;
        this.avgBusy = 0;
        this.demandMult = 1;
        this.noiseValue = 0;
        this.noiseGoal = 0;
        this.noiseTimer = 0;
        this.warmupTime = 60;
    }

    update(deltaSeconds, simulation, targetBusyRatio, realisticMode, spawnRider)
    {
        if (realisticMode)
        {
            this.updateRealistic(deltaSeconds, simulation, spawnRider);
            return;
        }

        // get the main values from the sim
        const driverCount = Math.max(1, simulation.driverList.size);
        const simSeconds = deltaSeconds * 60 * (simulation.simSpeed / simulation.baseSimSpeed);
        const simMinutes = simSeconds / 60;
        const dispatch = simulation.dispatchEngine;
        const ridesDone = dispatch.rideAmount;
        const waitPerDriver = dispatch.waitingCount / driverCount;
        const targetWait = targetBusyRatio <= 1 ? 0.004 : 0.004 + ((targetBusyRatio - 1) * 0.12);

        // smooth out busy percent and rides done so it does not jump around too much
        this.avgBusy += ((((driverCount - dispatch.availableCount) / driverCount) - this.avgBusy) * (1 - Math.exp(-simSeconds / 240)));
        this.rideRate += ((((ridesDone - this.lastRideCount) / simSeconds) - this.rideRate) * (1 - Math.exp(-simSeconds / 180)));
        this.lastRideCount = ridesDone;
        const busyGap = Math.min(targetBusyRatio, 1) - this.avgBusy;

        // this adds a bit of random change so the demand feels less robotic
        this.noiseTimer -= simSeconds;
        if (this.noiseTimer <= 0)
        {
            this.noiseGoal = (Math.random() * 2) - 1;
            this.noiseTimer = 120 + (Math.random() * 180);
        }

        this.noiseValue += (this.noiseGoal - this.noiseValue) * (1 - Math.exp(-simSeconds / 120));

        // move demand up or down based on how busy the drivers are and how many riders are waiting
        this.demandMult += busyGap * 0.22 * simMinutes;
        this.demandMult += (targetWait - waitPerDriver) * 0.10 * simMinutes;

        if (busyGap > 0.04 && waitPerDriver < targetWait + 0.01)
            this.demandMult += busyGap * 0.30 * simMinutes;

        if (waitPerDriver > targetWait + 0.03)
            this.demandMult -= (waitPerDriver - (targetWait + 0.03)) * 0.28 * simMinutes;

        this.demandMult = Math.max(0.55, Math.min(3.0, this.demandMult));

        // this is the final rider spawn rate
        let rate = Math.max(((driverCount * Math.max(0.25, targetBusyRatio)) / (this.getServiceMinutes(simulation) * 60)) * 1.18, this.rideRate) * this.demandMult;
        rate *= 1 + (this.noiseValue * 0.12);

        if (waitPerDriver > targetWait + 0.05)
            rate *= 0.65;

        rate *= this.getWarmupAmount(simSeconds);
        rate = Math.max(0, Math.min(rate, driverCount * 0.08));
        this.spawnRate += (rate - this.spawnRate) * (1 - Math.exp(-simSeconds / 90));

        this.spawnRidersAtRate(this.spawnRate, simSeconds, spawnRider);
    }


    //ai implemented
    updateRealistic(deltaSeconds, simulation, spawnRider)
    {
        const driverCount = Math.max(1, simulation.driverList.size);
        const simSeconds = deltaSeconds * 60 * (simulation.simSpeed / simulation.baseSimSpeed);
        const serviceMinutes = this.getServiceMinutes(simulation);
        const targetLoad = 0.78;

        this.noiseTimer -= simSeconds;
        if (this.noiseTimer <= 0)
        {
            this.noiseGoal = (Math.random() * 2) - 1;
            this.noiseTimer = 180 + (Math.random() * 240);
        }

        this.noiseValue += (this.noiseGoal - this.noiseValue) * (1 - Math.exp(-simSeconds / 180));

        let rate = ((driverCount * targetLoad) / (serviceMinutes * 60)) * 1.02;
        rate *= 1 + (this.noiseValue * 0.20);
        rate *= this.getWarmupAmount(simSeconds);
        rate = Math.max(0, Math.min(rate, driverCount * 0.06));
        this.spawnRate += (rate - this.spawnRate) * (1 - Math.exp(-simSeconds / 180));

        this.spawnRidersAtRate(this.spawnRate, simSeconds, spawnRider);
    }

    getWarmupAmount(simSeconds)
    {
        if (this.warmupTime <= 0)
            return 1;

        const amount = 1 - Math.min(1, this.warmupTime / 60);
        this.warmupTime = Math.max(0, this.warmupTime - simSeconds);
        return amount;
    }

    //ai end

    getServiceMinutes(simulation)
    {
        // once enough rides are done, use the average ride time
        if (simulation.averageRideTimeCount >= 8)
            return Math.max(5, Math.min(16, (simulation.averageRideTime * 1.2) + 1.0));
        return 7;
    }

    spawnRidersAtRate(ratePerSecond, simSeconds, spawnRider)
    {
        if (ratePerSecond <= 0)
            return;

        let timeLeft = simSeconds;

        while (timeLeft > 0)
        {
            // split long time into smaller pieces so riders do not all show up at once
            const step = Math.min(timeLeft, 5);
            const spawnCount = this.getPoissonCount(ratePerSecond * step);

            for (let i = 0; i < spawnCount; i++)
                spawnRider();

            timeLeft -= step;
        }
    }

    getPoissonCount(lambda)
    {
        if (lambda <= 0)
            return 0;

        if (lambda < 12)
        {
            // for smaller numbers, do the exact random count
            const limit = Math.exp(-lambda);
            let product = 1;
            let count = 0;

            while (product > limit)
            {
                count++;
                product *= Math.random();
            }

            return count - 1;
        }

        // for bigger numbers, this is a faster close enough version
        return Math.max(0, Math.round(lambda + (Math.sqrt(lambda) * this.getNormal())));
    }

    getNormal()
    {
        const u1 = Math.max(Math.random(), 0.000001);
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
}
