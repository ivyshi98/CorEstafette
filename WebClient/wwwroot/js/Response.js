var Response = /** @class */ (function () {
    function Response(id, content, sender, topic, success) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
        this.timeStamp = new Date();
        this.success = success;
    }
    Object.defineProperty(Response.prototype, "Topic", {
        get: function () { return this.topic; },
        set: function (value) { this.topic = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Response.prototype, "CorrelationId", {
        get: function () { return this.correlationId; },
        set: function (value) { this.correlationId = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Response.prototype, "Sender", {
        get: function () { return this.sender; },
        set: function (value) { this.sender = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Response.prototype, "Content", {
        get: function () { return this.content; },
        set: function (value) { this.content = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Response.prototype, "TimeStamp", {
        get: function () { return this.timeStamp; },
        set: function (value) { this.timeStamp = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Response.prototype, "Success", {
        get: function () { return this.success; },
        set: function (value) { this.success = value; },
        enumerable: false,
        configurable: true
    });
    return Response;
}());
export { Response };
//# sourceMappingURL=Response.js.map