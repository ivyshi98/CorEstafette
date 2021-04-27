import * as signalR from "@microsoft/signalr";
import { Communicator } from "./communicator";

let comm = new Communicator();

let receiveCallback = function (user: string, message: string) {
    let msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = user + " says " + msg;
    let li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
}

let responseCallback = function (message: string) {
    let msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = msg;
    let li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
}

let testTopicCallback = function () {
    console.log("I subscribed to a topic");
}

comm.registerReceiveCallback(receiveCallback);
comm.registerResponseCallback(responseCallback);

document.getElementById("subscribeButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userInput")).value;
    let topic = (<HTMLInputElement>document.getElementById("topicInput")).value;
    
    comm.subscribeAsync(topic, testTopicCallback);
});

document.getElementById("publishButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userInput")).value;
    let topic = (<HTMLInputElement>document.getElementById("topicInput")).value;
    let message = (<HTMLInputElement>document.getElementById("messageInput")).value;
    comm.publish(user, topic, message);

});

document.getElementById("unsubscribeButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userInput")).value;
    let topic = (<HTMLInputElement>document.getElementById("topicInput")).value;
    comm.unsubscribeAsync(topic);
});