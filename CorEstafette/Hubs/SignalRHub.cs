﻿using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using SignalRCommunicator;
using System;
using System.Collections.Concurrent;
using System.Diagnostics;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class SignalRHub : Hub
    {

        private static readonly ConcurrentDictionary<string, string> ConnectedClients = new ConcurrentDictionary<string, string>();
        private static readonly ConcurrentDictionary<string, TaskCompletionSource<IResponse>> responsesByCorrelationIds = new ConcurrentDictionary<string, TaskCompletionSource<IResponse>>();
        private static readonly ConcurrentDictionary<string, string> RespondersList = new ConcurrentDictionary<string, string>();

        public async Task<IResponse> ConnectAsync(string userName)
        {
            bool success = ConnectedClients.TryAdd(userName, Context.ConnectionId);
            IResponse res = new Response("", $"{userName} {(success ? "successfully registered to the service" : "failed to register due to duplicate user name")}", success);
            return res;
        }

        public IResponse AddResponder(string userName)
        {
            ConnectedClients.TryGetValue(userName, out string connId);
            if (connId != null)
            {
                bool success = RespondersList.TryAdd(userName, connId);
                return new Response(null, $"{userName} was {(success ? "successfully added to" : "already in")} the Responser's list", true);
            }
            
            return new Response(null, $"{userName} is not registered on the service.", false);
        }

        internal IResponse VerifyResponderIsInList(string userName)

        {
            bool success = RespondersList.ContainsKey(userName);
            return new Response(null, $"{userName} is {(success ? "" : "not" )} in the responder's list.", success);
        }

        //publish message to a particular topic
        public async Task PublishAsync(Message message)
        {
            await Clients.OthersInGroup(message.Topic).SendAsync("OnPublish", message);
        }

        //method for client to subscribe for a topic
        public async Task<IResponse> SubscribeTopicAsync(Message message)
        {
            //System.Threading.Thread.Sleep(4000);
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
            
            if(!VerifyResponderIsInList(request.Responder).Success)
                return new Response(false, request.CorrelationId, null, $"Request failed, {request.Responder} is not in the Responder list.", request.Sender, DateTime.Now);

            responsesByCorrelationIds[request.CorrelationId] = new TaskCompletionSource<IResponse>();

            await Clients.Client(ConnectedClients[request.Responder]).SendAsync("OnQuery", request);
            var responseTask = responsesByCorrelationIds[request.CorrelationId].Task;
            var timeoutTask = Task.Delay(5000);
            var result = await Task.WhenAny(responseTask, timeoutTask);

            if (result == responseTask)
            {
                responsesByCorrelationIds.TryRemove(request.CorrelationId, out var tcs);
                return tcs.Task.Result;
            }
            return new Response(false, request.CorrelationId, null, "Timeout error : Query failed after 5 seconds", request.Sender, DateTime.Now);
        }

        public void RespondQueryAsync(Response response)
        {
            responsesByCorrelationIds[response.CorrelationId].SetResult(response);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            string userName = "";
            foreach (var pair in ConnectedClients)
            {
                if (pair.Value == Context.ConnectionId)
                    userName = pair.Key;
            }

            ConnectedClients.TryRemove(userName, out _);
            RespondersList.TryRemove(userName, out _);
            return base.OnDisconnectedAsync(exception);
        }
    }

}


