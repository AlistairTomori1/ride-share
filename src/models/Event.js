export default class EventLog {

    constructor()
    {
        this.log = [];
    }

    addEvent(event)
    {
        this.log.push(event);
        console.log(event);
    }
}