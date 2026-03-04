class Scoring
{
    constructor()
    {

    }

    scoreDistance(driver, rider)
    {
        let xDist = Math.abs(driver.location.x - rider.location.x);
        let yDist = Math.abs(driver.location.y - rider.location.y);
        let dist = Math.sqrt((xDist ** 2) + (yDist ** 2));
        return(dist);
    }

    scoreCapacity(driver, rider)
    {
        if (driver.capacity < rider.passengers)
            return Infinity;

        return(1);

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
            return(1);

    }

    calculateScore(driver, rider)
    {
        return(this.scoreDistance(driver, rider) + this.scoreCapacity(driver, rider) + this.scoreAmenities(driver, rider));
    }
}
export default Scoring;