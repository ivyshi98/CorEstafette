import { Communicator } from "./communicator";
import { IResponse } from "./IResponse";
import { IMessage } from "./IMessage";
import { IRequest } from "./IRequest";
import { ICommunicator } from "./ICommunicator";

let comm: ICommunicator;

//callback for receiving connection feedback
let onConnect = function (response: IResponse) {
    console.log(onConnect);
    let msg = response.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = "<div class='message'>" + msg + "</div>"
    let li = document.createElement("li");
    li.innerHTML = msg;//TODO: fix later
    document.getElementById("messagesList").appendChild(li);
}

//callback for receiving messages
let onReceive = function (message: IMessage) {
    //console.log(message);
    let msg = message.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = "<div>Received message <div class='message'>" + msg + "</div> under topic <div class='message'>" + message.Topic + "</div></div>";
    let li = document.createElement("li");
    li.innerHTML = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
}

let onRequest = function (request: IRequest): string {
    let encodedMsg = "<div>Received a request message from <div class='message'>" + request.Sender+"</div></div>";
    let li = document.createElement("li");
    li.innerHTML = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
    return "echo back";
}

document.getElementById("connectButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userName")).value;
    comm = new Communicator(user, onConnect);
    comm.addResponder(user, onRequest);
});


document.getElementById("subButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("subTopic")).value;
    let result = comm.subscribeAsync(topic, onReceive);
    result.then((res: IResponse) => {
        console.log(res);
        let li = document.createElement("li");
        li.innerHTML = "<div>Subscribed to <div class='message'>" + topic + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: IResponse) => {
        console.log(err);
        let li = document.createElement("li");
        li.innerHTML = "<div>Failed to subscribe with error: <div class='message'>" + err.Content + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    });
});

document.getElementById("publishButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("publishTopic")).value;
    let message = (<HTMLInputElement>document.getElementById("publishMessage")).value;
    comm.publish(topic, message);
    let li = document.createElement("li");
    li.innerHTML = "<div>Published to topic: <div class='message'>" + topic + "</div></div>";
    document.getElementById("messagesList").appendChild(li);
});

document.getElementById("unsubButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("subTopic")).value;
    let result = comm.unsubscribeAsync(topic);
    result.then((res : IResponse) => {
            let li = document.createElement("li");
            li.innerHTML = "<div>Unsubscribed from <div class='message'>" + res.Topic + "</div></div>";
            document.getElementById("messagesList").appendChild(li);
    }).catch((err: IResponse) => {
            console.log(err);
            let li = document.createElement("li");
            li.innerHTML = "<div>Failed to unsubscribe with error: <div class='message'>" + err.Content + "</div></div>";
            document.getElementById("messagesList").appendChild(li);
        });

});

//TODO: fix this like sub/unsub later
document.getElementById("requestButton").addEventListener("click", function () {
   // let topic = (<HTMLInputElement>document.getElementById("additionalData")).value;

    let additionalData = (<HTMLInputElement>document.getElementById("additionalData")).value;
    let responder = (<HTMLInputElement>document.getElementById("responder")).value;

    
    //comm.queryAsync(responder, additionalData);
    //comm.addResponder(responder, onRequest);
    
    let result = comm.queryAsync(responder, additionalData);

    result.then((res: IResponse) => {
        //test
        const messageReceived: IResponse = <IResponse>res;
        console.log(messageReceived);
        let li = document.createElement("li");
        li.innerHTML = "<div>Received <div class='message'>" + messageReceived.Content + "</div> from <div class='message'>" + responder + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
        console.log(err);
        let li = document.createElement("li");
        li.innerHTML = "<div>Failed to request from <div class='message'>" + responder + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    });
    

})

document.getElementById("disconnectButton").addEventListener("click", function () {
    let result = comm.disconnectAsync();
    result.then((res: IResponse) => {
        let li = document.createElement("li");
        li.textContent = "disconnected from the service";
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: IResponse) => {
        let li = document.createElement("li");
        li.innerHTML = "<div>Failed to disconnect with error: <div class='message'>" + err.Content + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    });
});