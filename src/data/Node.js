export default class Node {
    constructor(id, location, role) {
        this.id = id;
        this.location = location;
        this.role = role;
        this.next = null;
        this.prev = null;
    }
}