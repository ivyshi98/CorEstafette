import { Communicator } from "./communicator";
import { IResponse } from "./IResponse";
import { IMessage } from "./IMessage";
import { IRequest } from "./IRequest";
import { ICommunicator } from "./ICommunicator";

let comm: ICommunicator;


let onConnect = function (response: IResponse) {
    console.log(onConnect);
    let msg = response.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = "<div class='message'>" + msg + "</div>"
    let li = document.createElement("li");
    li.innerHTML = msg;//TODO: fix later
    document.getElementById("messagesList").appendChild(li);
}

let onReceive = function (message: IMessage) {
    let msg = message.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = "<div>Received message <div class='message'>" + msg + "</div> under topic <div class='message'>" + message.Topic + "</div></div>";
    let li = document.createElement("li");
    li.innerHTML = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
}

let onRequest = function (request: IRequest): Promise<any> {
    let encodedMsg = "<div>Received a request message from <div class='message'>" + request.Sender+"</div></div>";
    let li = document.createElement("li");
    li.innerHTML = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
    return new Promise<any>((resolve, reject) => {
        var requestContent: string = "echo back";
        resolve(requestContent);
 
    });
}


document.getElementById("connectButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userName")).value;
    comm = new Communicator(user, onConnect);

    //TODO:Need to wait until connection is on to addResponder
    //Right now calling ti in subscribe for a temp workaround
    //comm.addResponder(user, onRequest);

});



document.getElementById("subButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("subTopic")).value;
    let user = (<HTMLInputElement>document.getElementById("userName")).value;
    //TODO:see comment in line 44,45
    comm.addResponder(user, onRequest);
    let result = comm.subscribeAsync(topic, onReceive);
    result.then((res: any) => {
        //test
        //const messageReceived: IResponse = <IResponse>res;
        //console.log(messageReceived);
        let li = document.createElement("li");
        li.innerHTML = "<div>Subscribed to <div class='message'>" + topic + "</div></div>";
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
        console.log(err);
        let li = document.createElement("li");
        li.textContent = "Failed to subscribe";
        document.getElementById("messagesList").appendChild(li);
    });
});

document.getElementById("publishButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("publishTopic")).value;
    let message = (<HTMLInputElement>document.getElementById("publishMessage")).value;
    comm.publish(topic, message);

});

document.getElementById("unsubButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("subTopic")).value;
    let result = comm.unsubscribeAsync(topic);
    result.then((res : any) => {
            //test
            //const messageReceived: IResponse = <IResponse>res;
            //console.log(messageReceived);
            let li = document.createElement("li");
            li.innerHTML = "<div>Unsubscribed from <div class='message'>" + topic + "</div></div>";
            document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
            console.log(err);
            let li = document.createElement("li");
            li.textContent = "Failed to unsubscribe";
            document.getElementById("messagesList").appendChild(li);
        });

});

document.getElementById("requestButton").addEventListener("click", function () {
    let additionalData = (<HTMLInputElement>document.getElementById("additionalData")).value;
    let responder = (<HTMLInputElement>document.getElementById("responder")).value;
    let result = comm.queryAsync(responder, additionalData);

    result.then((res: IResponse) => {
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
    result.then((res: any) => {
        let li = document.createElement("li");
        li.textContent = "disconnected from the service";
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
        let li = document.createElement("li");
        li.textContent = "disconnection failed";
        document.getElementById("messagesList").appendChild(li);
    });
});