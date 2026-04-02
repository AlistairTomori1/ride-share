export default class EventLog {

    constructor()
    {
        this.log = [];
    }

    addEvent(event)
    {
        this.log.push(event);
        if (this.log.length > 1000)
            this.log.shift();
    }
}