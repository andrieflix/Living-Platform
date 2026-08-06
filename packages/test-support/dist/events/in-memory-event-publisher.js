export class InMemoryEventPublisher {
    published = [];
    async publish(event) {
        this.published.push(event);
    }
    async publishAll(events) {
        for (const event of events) {
            this.published.push(event);
        }
    }
    clear() {
        this.published.length = 0;
    }
    get count() {
        return this.published.length;
    }
}
//# sourceMappingURL=in-memory-event-publisher.js.map