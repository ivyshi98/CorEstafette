var Request = /** @class */ (function () {
    function Request(id, content, sender, topic, destination) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
        this.timeStamp = new Date();
        this.destination = destination;
    }
    Object.defineProperty(Request.prototype, "Topic", {
        get: function () { return this.topic; },
        set: function (value) { this.topic = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "CorrelationId", {
        get: function () { return this.correlationId; },
        set: function (value) { this.correlationId = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "Sender", {
        get: function () { return this.sender; },
        set: function (value) { this.sender = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "Content", {
        get: function () { return this.content; },
        set: function (value) { this.content = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "TimeStamp", {
        get: function () { return this.timeStamp; },
        set: function (value) { this.timeStamp = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "Destination", {
        get: function () { return this.destination; },
        set: function (value) { this.destination = value; },
        enumerable: false,
        configurable: true
    });
    return Request;
}());
export { Request };
//# sourceMappingURL=Request.js.map