var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as signalR from "@microsoft/signalr";
import { Guid } from "guid-typescript";
import { Message } from "./message";
import { Response } from "./Response";
import { Request } from "./Request";
var Communicator = /** @class */ (function () {
    function Communicator(user, connectCallback) {
        var _this = this;
        this.establishConnection("https://localhost:5001/signalRhub", connectCallback);
        this.callbacksByTopics = new Map();
        this.callbacksByResponder = new Map();
        //generate unique user id
        //this.userId = "User" + Math.floor(Math.random() * (100 - 1 + 1)) + 1;
        this.userId = user;
        console.log(this.userId);
        //invoke the proper callback when the hub sends topic-based message to the client
        this.registerCallback("onPublish", function (messageReceived) {
            var topicCallback = _this.callbacksByTopics.get(messageReceived.Topic);
            topicCallback(messageReceived); //invoke callback
        });
        this.registerCallback("OnQuery", function (requestReceived) {
            console.log(requestReceived);
            console.log(_this.callbacksByResponder);
            var respondCallback = _this.callbacksByResponder.get(requestReceived.Destination);
            //let respondCallback = this.callbacksByResponder.get("user");
            var result = respondCallback(requestReceived);
            console.log(result);
            var responseToSend = new Response(requestReceived.CorrelationId, result, requestReceived.Sender, "", true);
            console.log(responseToSend);
            _this.connection.invoke("RespondQueryAsync", responseToSend);
        });
    }
    //construct and return a timeout promise which will reject after 2 seconds
    Communicator.prototype.timeoutAsync = function (ms, correlationId, content, sender, topic) {
        if (ms === void 0) { ms = 2000; }
        if (correlationId === void 0) { correlationId = ""; }
        if (content === void 0) { content = "timeout"; }
        if (sender === void 0) { sender = ""; }
        if (topic === void 0) { topic = ""; }
        var timeoutResponse = new Response(correlationId, content, sender, topic, false);
        return new Promise(function (resolve, reject) { return setTimeout(function () {
            reject(timeoutResponse);
        }, ms); });
    };
    //register the handler to the hub method
    Communicator.prototype.registerCallback = function (hubMethod, handler) {
        this.connection.on(hubMethod, handler);
    };
    //initialize the connection and start it; throw an exception if connection fails
    Communicator.prototype.establishConnection = function (url, connectionHandler) {
        var _this = this;
        this.connection = new signalR.HubConnectionBuilder().withUrl(url).build();
        this.connection.start().then(function (resolve) {
            var registerTask = _this.connection.invoke("ConnectAsync", _this.userId);
            var timeoutTask = _this.timeoutAsync();
            return Promise.race([registerTask, timeoutTask]);
        }, function (reject) {
            throw new Response("", "connection rejected", "", "", false);
        }).then(function (resolve) {
            console.log(resolve);
            if (resolve.Success === true) {
                connectionHandler(resolve);
                console.log("successfully registered"); //TODO: notify user?
            }
            else { //duplicate user name, need to stop connection and throw
                _this.connection.stop();
                throw resolve;
            }
        }, function (reject) {
            throw new Response("", "failed to register the connection", "", "", false);
        });
    };
    Communicator.prototype.publish = function (topic, message) {
        console.log("Client called publish method"); //test
        var correlationID = Guid.create().toString();
        var messageToSend = new Message(correlationID, message, this.userId, topic);
        console.log(messageToSend);
        this.connection.invoke("PublishAsync", messageToSend);
    };
    Communicator.prototype.subscribeAsync = function (topic, topicCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var duplicateSubResponse_1, correlationID, messageToSend, serviceTask, timeoutTask, taskResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Client called subscribe method"); //test
                        if (!this.callbacksByTopics.has(topic)) return [3 /*break*/, 1];
                        duplicateSubResponse_1 = new Response("", "cannot subscribe to the same topic twice", this.userId, topic, false);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                reject(duplicateSubResponse_1);
                            })];
                    case 1:
                        correlationID = Guid.create().toString();
                        messageToSend = new Message(correlationID, "", this.userId, topic);
                        serviceTask = this.connection.invoke("SubscribeTopicAsync", messageToSend);
                        timeoutTask = this.timeoutAsync();
                        return [4 /*yield*/, Promise.race([serviceTask, timeoutTask])];
                    case 2:
                        taskResult = _a.sent();
                        if (taskResult.Success === true) {
                            //add callback function to the dictionary
                            console.log("sub success"); //test
                            this.callbacksByTopics.set(topic, topicCallback);
                            console.log(this.callbacksByTopics); //test
                        }
                        //test
                        console.log("print the promise and response:");
                        console.log(serviceTask);
                        console.log(timeoutTask);
                        console.log(taskResult);
                        return [2 /*return*/, taskResult];
                }
            });
        });
    };
    Communicator.prototype.unsubscribeAsync = function (topic) {
        return __awaiter(this, void 0, void 0, function () {
            var duplicateUnsubResponse_1, correlationID, messageToSend, serviceTask, timeoutTask, taskResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Client called unsubscribe method");
                        if (!!this.callbacksByTopics.has(topic)) return [3 /*break*/, 1];
                        duplicateUnsubResponse_1 = new Response("", "you need to subscribe before unsubscribing", this.userId, topic, false);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                reject(duplicateUnsubResponse_1);
                            })];
                    case 1:
                        correlationID = Guid.create().toString();
                        messageToSend = new Message(correlationID, "", this.userId, topic);
                        serviceTask = this.connection.invoke("UnsubscribeTopicAsync", messageToSend);
                        timeoutTask = this.timeoutAsync();
                        return [4 /*yield*/, Promise.race([serviceTask, timeoutTask])];
                    case 2:
                        taskResult = _a.sent();
                        if (taskResult.Success === true) {
                            console.log("unsub success"); //test
                            //remove from dictionary
                            this.callbacksByTopics.delete(topic);
                            console.log(this.callbacksByTopics); //test
                        }
                        //test
                        console.log("print the promise and response:");
                        console.log(serviceTask);
                        console.log(timeoutTask);
                        console.log(taskResult);
                        return [2 /*return*/, taskResult];
                }
            });
        });
    };
    Communicator.prototype.queryAsync = function (responder, additionalData) {
        return __awaiter(this, void 0, void 0, function () {
            var correlationID, requestToSend, serviceTask, timeoutTask, taskResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        correlationID = Guid.create().toString();
                        requestToSend = new Request(correlationID, additionalData, this.userId, null, responder);
                        console.log(requestToSend);
                        serviceTask = this.connection.invoke("QueryAsync", requestToSend);
                        timeoutTask = this.timeoutAsync();
                        return [4 /*yield*/, Promise.race([serviceTask, timeoutTask])];
                    case 1:
                        taskResult = _a.sent();
                        console.log(taskResult);
                        return [2 /*return*/, taskResult];
                }
            });
        });
    };
    //bool AddResponse(string responder, Func<IRequest, object> callback);
    Communicator.prototype.addResponder = function (responder, respondCallback) {
        if (!this.callbacksByResponder.has(responder)) {
            this.callbacksByResponder.set(responder, respondCallback);
            console.log(this.callbacksByResponder);
        }
    };
    Communicator.prototype.disconnectAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var serviceTask, timeoutTask, taskResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serviceTask = this.connection.stop();
                        timeoutTask = this.timeoutAsync();
                        return [4 /*yield*/, Promise.race([serviceTask, timeoutTask])];
                    case 1:
                        taskResult = _a.sent();
                        return [2 /*return*/, taskResult];
                }
            });
        });
    };
    return Communicator;
}());
export { Communicator };
//# sourceMappingURL=communicator.js.map