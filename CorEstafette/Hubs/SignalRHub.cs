using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using SignalRCommunicator;
using System;
using System.Collections.Concurrent;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class SignalRHub : Hub
    {
        private static ConcurrentDictionary<string, string> ConnectedClients = new ConcurrentDictionary<string, string>();
        private static ConcurrentDictionary<string, TaskCompletionSource<IResponse>> responsesByCorrelationIds = new ConcurrentDictionary<string, TaskCompletionSource<IResponse>>();
        private static ConcurrentDictionary<string, string> RespondersList = new ConcurrentDictionary<string, string>();


        public async Task<IResponse> ConnectAsync(string userName)
        {
            bool success = ConnectedClients.TryAdd(userName, Context.ConnectionId);
            IResponse res = new Response("", $"{userName} {(success ? "successfully registered" : "failed to register")} to the service", success);
            return res;
        }

        public IResponse VerifyUserRegistered(string userName)
        {
            bool success = ConnectedClients.ContainsKey(userName);
            if (success)
            {
                success = RespondersList.TryAdd(userName, Context.ConnectionId);
                return new Response(null, $"{userName} was {(success ? "successfully added to" : "already in")} the Responser's list", success);
            }
            RespondersList.TryRemove(userName, out var _);
            return new Response(null, $"{userName} is not registered on the service.", success);
        }

        public IResponse VerifyUserInResponserList(string userName)
        {
            bool success = RespondersList.ContainsKey(userName);
            // Check if still connected
            if (success)
                return VerifyUserRegistered(userName);

            return new Response(null, $"{userName} is not in the responder's list.", success);
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

        public override Task OnDisconnectedAsync(System.Exception exception)
        {
            string userName = "";
            foreach (var pair in ConnectedClients)
            {
                if (pair.Value == Context.ConnectionId)
                    userName = pair.Key;
            }

            ConnectedClients.TryRemove(userName, out _);
            return base.OnDisconnectedAsync(exception);
        }
    }

}
