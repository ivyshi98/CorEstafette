import { Communicator } from "./communicator";
var comm;
var onConnect = function (response) {
    console.log(onConnect);
    var msg = response.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = "<div class='message'>" + msg + "</div>";
    var li = document.createElement("li");
    li.innerHTML = msg; //TODO: fix later
    document.getElementById("messagesList").appendChild(li);
};
//callback for receiving messages
var onReceive = function (message) {
    //console.log(message);
    var msg = message.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = "<div>Received message <div class='message'>" + msg + "</div> under topic <div class='message'>" + message.Topic + "</div></div>";
    var li = document.createElement("li");
    li.innerHTML = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
};
var onRequest = function (request) {
    var encodedMsg = "<div>Received a request message from <div class='message'>" + request.Sender + "</div></div>";
    var li = document.createElement("li");
    li.innerHTML = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
    return "echo back";
};
document.getElementById("connectButton").addEventListener("click", function () {
    var user = document.getElementById("userName").value;
    comm = new Communicator(user, onConnect);
    comm.addResponder(user, onRequest);
});
//Add user callback to responder map
//move to constructor later?
//comm.addResponder("user", onRequest);
document.getElementById("subButton").addEventListener("click", function () {
    var topic = document.getElementById("subTopic").value;
    var result = comm.subscribeAsync(topic, onReceive);
    result.then(function (res) {
        //test
        //const messageReceived: IResponse = <IResponse>res;
        //console.log(messageReceived);
        var li = document.createElement("li");
        li.innerHTML = "<div>Subscribed to <div class='message'>" + topic + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    }).catch(function (err) {
        console.log(err);
        var li = document.createElement("li");
        li.textContent = "Failed to subscribe";
        document.getElementById("messagesList").appendChild(li);
    });
});
document.getElementById("publishButton").addEventListener("click", function () {
    var topic = document.getElementById("publishTopic").value;
    var message = document.getElementById("publishMessage").value;
    comm.publish(topic, message);
});
document.getElementById("unsubButton").addEventListener("click", function () {
    var topic = document.getElementById("subTopic").value;
    var result = comm.unsubscribeAsync(topic);
    result.then(function (res) {
        //test
        //const messageReceived: IResponse = <IResponse>res;
        //console.log(messageReceived);
        var li = document.createElement("li");
        li.innerHTML = "<div>Unsubscribed from <div class='message'>" + topic + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    }).catch(function (err) {
        console.log(err);
        var li = document.createElement("li");
        li.textContent = "Failed to unsubscribe";
        document.getElementById("messagesList").appendChild(li);
    });
});
document.getElementById("requestButton").addEventListener("click", function () {
    // let topic = (<HTMLInputElement>document.getElementById("additionalData")).value;
    var additionalData = document.getElementById("additionalData").value;
    var responder = document.getElementById("responder").value;
    //comm.queryAsync(responder, additionalData);
    //comm.addResponder(responder, onRequest);
    var result = comm.queryAsync(responder, additionalData);
    result.then(function (res) {
        //test
        var messageReceived = res;
        console.log(messageReceived);
        var li = document.createElement("li");
        li.innerHTML = "<div>Received <div class='message'>" + messageReceived.Content + "</div> from <div class='message'>" + responder + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    }).catch(function (err) {
        console.log(err);
        var li = document.createElement("li");
        li.innerHTML = "<div>Failed to request from <div class='message'>" + responder + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    });
});
document.getElementById("disconnectButton").addEventListener("click", function () {
    var result = comm.disconnectAsync();
    result.then(function (res) {
        var li = document.createElement("li");
        li.textContent = "disconnected from the service";
        document.getElementById("messagesList").appendChild(li);
    }).catch(function (err) {
        var li = document.createElement("li");
        li.textContent = "disconnection failed";
        document.getElementById("messagesList").appendChild(li);
    });
});
//# sourceMappingURL=site.js.map