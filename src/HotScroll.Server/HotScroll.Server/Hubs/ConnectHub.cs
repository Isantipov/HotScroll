using HotScroll.Server.Domain;
using Microsoft.AspNet.SignalR;

namespace HotScroll.Server.Hubs
{
    /// <summary>
    ///     Manage connections.
    /// </summary>
    public class ConnectHub : Hub
    {
        public void Connect(User user)
        {
            Clients.AllExcept(Context.ConnectionId).userConnected(user);
        }
    }
}