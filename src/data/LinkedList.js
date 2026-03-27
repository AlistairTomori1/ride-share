import Node from "./Node.js";
export default class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
  
    addLink(node) {
        node.next = null;
        node.prev = null;
        if (this.head === null) {
            this.head = node;
            this.tail = node;
        }
        else {
            let curr = this.tail;
            curr.next = node;
            node.prev = this.tail;
            this.tail = node;
        }
        this.size++
    }

    remove(node) {
        if (node.prev != null)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next != null)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;

        this.size--;
        node.next = null;
        node.prev = null;
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