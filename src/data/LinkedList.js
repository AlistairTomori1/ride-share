import Node from "./Node.js";
export default class LinkedList {
    constructor() {
        this.head = null;
        this.size = 1;
    }
  
    addLink(node) {
        node.next = null;
        if (this.head === null) {
            this.head = node;
        }
        else {
            let curr = this.head;
            while (curr.next !== null) {
                curr = curr.next; 
            }
            curr.next = node;
        }
        this.size++
    }

    remove(node) {
        if (this.head === null)
            return;
        if (this.head === node)
        {
            this.head = this.head.next;
            return;
        }
        let curr = this.head;
        while (curr.next !== null)
        {
            if (curr.next === node)
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
            if (predicate(curr))
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
            callback(curr);
            curr = curr.next;
        }
    }
}