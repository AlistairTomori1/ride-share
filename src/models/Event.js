export default class Event{

    constructor(driver, rider, type, surge, time, length)
    {
        this.driver = driver;
        this.rider = rider;
        this.type = type;
        this.surge = surge;
        this.time = time;
        this.length = length;
        this.event = this.addEvent();
        
    }

    addEvent()
    {
        if (this.type == "expire")
            return("Rider " + this.rider.id + " has been expired");
        else if (this.type == "assigned")
            return("Driver " + this.driver.id + " has been assigned to rider " + this.rider.id);
        else if (this.type == "pickup")
            return("Driver " + this.driver.id + " has picked up rider " + this.rider.id + " In " + Math.round(this.length) + " Minutes");
        else if (this.type == "dropoff")
            return("Driver " + this.driver.id + " has dropped off rider " + this.rider.id + " In " + Math.round(this.length) + " Minutes");
        else if (this.type == "surge")
            return("Surge updated to " + this.surge + "x")
    }
}
