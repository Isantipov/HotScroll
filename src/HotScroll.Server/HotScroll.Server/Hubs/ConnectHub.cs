using HotScroll.Server.Domain;
using HotScroll.Server.Services;
using Microsoft.AspNet.SignalR;

namespace HotScroll.Server.Hubs
{
    /// <summary>
    ///     Manage connections.
    /// </summary>
    public class ConnectHub : Hub
    {
        
        public User Connect(User user)
        {
            UserService.AddUser(user);
            Clients.All.userConnected(user);

            return user;
        }
    }
}