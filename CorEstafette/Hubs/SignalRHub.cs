 using Microsoft.AspNetCore.SignalR;
using System.Threading;
using System.Threading.Tasks;
using SignalRCommunicator;
using System.Collections.Generic;
using System;
using System.Diagnostics;
using System.Collections.Concurrent;


//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{

    public class Request
    {


        public string CorrelationId { get; set; }
        public string Content { get; set; }
        public string Sender { get; set; }
        public string Topic { get; set; }
        public DateTime TimeStamp { get; set; }
        public string Responder { get; set; }
    }



    public class SignalRHub : Hub
    {

        static private ConcurrentDictionary<string, string> ConnectedClients = new ConcurrentDictionary<string, string>();
    
        private static ConcurrentDictionary<string, TaskCompletionSource<IResponse>> responsesByCorrelationIds = new ConcurrentDictionary<string, TaskCompletionSource<IResponse>>();

        //public override Task OnConnectedAsync()
        //{
        //    System.Threading.Thread.Sleep(4000);//test timeout
        //    return base.OnConnectedAsync();
        //}

        //cache the connection's name and id; return a success response if the connection is valid;
        // return a failure response if the connection's name is already in used
        public async Task<IResponse> ConnectAsync(string userName)
        {
            bool success = ConnectedClients.TryAdd(userName, Context.ConnectionId);
            foreach (var kvp in ConnectedClients) { Debug.WriteLine(kvp.Key + " " + kvp.Value); } //test
            IResponse res = new Response("", userName +  " is connected to the service", true);
            return res;
        }

        //remove the connection from the cache
        public override Task OnDisconnectedAsync(Exception exception)
        {
            //var connName = Context.GetHttpContext().Request.Query["name"];
            foreach (var kvp in ConnectedClients)
            {
                if (kvp.Value == Context.ConnectionId)
                {
                    string userName = kvp.Key;
                    ConnectedClients.TryRemove(userName, out string connectId);
                }
            }
            //test
            Debug.WriteLine("print dict in onDisconnectedAsync");
            foreach (var kvp in ConnectedClients) {Debug.WriteLine(kvp.Key + " " + kvp.Value);}
            return base.OnDisconnectedAsync(exception);
        }

        //publish message to a particular topic
        public async Task PublishAsync(Message message)
        {
            await Clients.OthersInGroup(message.Topic).SendAsync("OnPublish", message);
        }

        //method for client to subscribe for a topic
        public async Task<IResponse> SubscribeTopicAsync(Message message)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, message.Topic);
            
            message.Content = $"{message.Sender} successfully subscribed to topic {message.Topic}";
            return new Response(message, true);
        }

        //method for client to unsubscribe from a topic
        public async Task<IResponse> UnsubscribeTopicAsync(Message message)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, message.Topic);
            message.Content = $"{message.Sender} successfully unsubscribe from topic {message.Topic}";
            return new Response(message, true);
        }

        public async Task<IResponse> QueryAsync(Request request)
        {
            responsesByCorrelationIds[request.CorrelationId] = new TaskCompletionSource<IResponse>();

            await Clients.Client(ConnectedClients[request.Responder]).SendAsync("OnQuery", request);
            var responseTask = responsesByCorrelationIds[request.CorrelationId].Task;
            var timeoutTask = Task.Delay(2000);
            var result = await Task.WhenAny(responseTask, timeoutTask);

            if (result == responseTask)
            {
                responsesByCorrelationIds.TryRemove(request.CorrelationId, out var tcs);
                return tcs.Task.Result;
            }
            return new Response(false, request.CorrelationId, null, "Query failed after 2 second time out", request.Sender, DateTime.Now); 
        }


        public void RespondQueryAsync(Response response)
        {

            responsesByCorrelationIds[response.CorrelationId].TrySetResult(response);
         }
         
    }
}
