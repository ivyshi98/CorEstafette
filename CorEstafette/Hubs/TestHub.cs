using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class TestHub : Hub
    {
        public async Task SendMessageAsync(string user, string message) //can be called by a connected client
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        //method for client to subscribe for a topic
        public async Task SubscribeTopicAsync(string topic)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, topic);
            await Clients.Group(topic).SendAsync("ReceiveGroup", $"{Context.ConnectionId} has joined the group {topic}.");
        }

        //method for client to unsubscribe from a topic
        public async Task UnsubscribeTopicAsync(string topic)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, topic);
            await Clients.Group(topic).SendAsync("ReceiveGroup", $"{Context.ConnectionId} has lefted the group {topic}.");

        }

        //method for client to publish a message under a topic
        public async Task PublishMessageAsync(string user, string topic, string message) //can be called by a connected client
        {
            Console.WriteLine("publish called in hub");//test
            await Clients.Group(topic).SendAsync("ReceiveMessage", user, message);
        }
    }
}
