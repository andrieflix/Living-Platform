export class DeterministicIdGenerator {
    counter = 0;
    generate() {
        this.counter += 1;
        return `id-${this.counter.toString().padStart(4, "0")}`;
    }
    generatePrefixed(prefix) {
        this.counter += 1;
        return `${prefix}_${this.counter.toString().padStart(4, "0")}`;
    }
    reset() {
        this.counter = 0;
    }
}
//# sourceMappingURL=deterministic-id-generator.js.map