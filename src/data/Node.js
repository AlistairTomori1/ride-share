Class Node {
    constructor(_id) {
        this.next = null;
        this.id = _id;
    }

    display() {
        console.log(this.id);
    }
}