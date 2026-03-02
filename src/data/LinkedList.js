Class LinkedList {
    constructor() {
        this.head = null;
        this.size = 1;
    }
  
    addLink() {
        let link = new Link(this.size);
        if (this.head === null) {
            this.head = link;
        }
        else {
            let curr = this.head;
            while (curr.next !== null) {
                curr = curr.next;
                curr.next = link;
            }
        }
    }
  
    displayList() {
        let curr = this.head;
        while (curr !== null) {
            text (this.id, 100, this.id*50);
            curr = curr.next;
        }
    }

    remove(n) {
        let prev = null; 
        let curr = this.head;
        while (curr.id !== n) {
            prev = curr;
            curr = curr.next; 
            if (curr === null) {
                return;
            }
        }
        prev.next = curr.next;
    }
}