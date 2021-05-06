var Message = /** @class */ (function () {
    function Message(id, content, sender, topic, timeStamp) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
        this.timeStamp = timeStamp || new Date();
    }
    Object.defineProperty(Message.prototype, "Topic", {
        get: function () { return this.topic; },
        set: function (value) { this.topic = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Message.prototype, "CorrelationId", {
        get: function () { return this.correlationId; },
        set: function (value) { this.correlationId = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Message.prototype, "Sender", {
        get: function () { return this.sender; },
        set: function (value) { this.sender = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Message.prototype, "Content", {
        get: function () { return this.content; },
        set: function (value) { this.content = value; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Message.prototype, "TimeStamp", {
        get: function () { return this.timeStamp; },
        set: function (value) { this.timeStamp = value; },
        enumerable: false,
        configurable: true
    });
    return Message;
}());
export { Message };
//# sourceMappingURL=Message.js.map