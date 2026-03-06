import Node from "./Node.js";
export default class LinkedList {
    constructor() {
        this.head = null;
        this.size = 1;
    }
  
    addLink(data) {
        let newNode = new Node(data);
        if (this.head === null) {
            this.head = newNode;
        }
        else {
            let curr = this.head;
            while (curr.next !== null) {
                curr = curr.next; 
            }
            curr.next = newNode;
        }
    }

    remove(data) {
        if (this.head === null)
            return;
        if (this.head.data === data)
            this.head = this.head.next;
        let curr = this.head;
        while (curr.next !== null)
        {
            if (curr.next.data === data)
            {
                curr.next = curr.next.next;
                return;
            }
            curr = curr.next;
        }
    }

    search(predicate)
    {
        let curr = this.head;
        while (curr !== null)
        {
            if (predicate(curr.data))
            {
                return curr;
            }
            curr = curr.next;

        }
        return;
    }
    traverse(callback)
    {
        let curr = this.head;
        while (curr !== null)
        {
            callback(curr.data);
            curr = curr.next;
        }
    }
}