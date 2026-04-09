export default class Scoring
{
    constructor()
    {

    }

    scoreDistance(driver, rider)
    {
        let xDist = Math.abs(driver.location[0] - rider.location[0]);
        let yDist = Math.abs(driver.location[1] - rider.location[1]);
        let dist = xDist + yDist;
        return(dist);
    }

    scoreCapacity(driver, rider)
    {
        if (driver.capacity < rider.passengers)
            return Infinity;
        else
            return(0);

    }

    scoreAmenities(driver, rider)
    {
        let score = 0;
        for (let i = 0; i < rider.amenitiesRequired.length; i++)
        {
            for (let j = 0; j < driver.amenities.length; j++)
            {
                if (rider.amenitiesRequired[i] == driver.amenities[j])
                    score++;

            }
        }
        if (score < rider.amenitiesRequired.length)
            return(Infinity);
        else
            return(0);

    }

    calculateScore(driver, rider)
    {
        return(this.scoreDistance(driver, rider) + this.scoreCapacity(driver, rider) + this.scoreAmenities(driver, rider));
    }
}