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

        /// <summary>
        /// Returns duel Id
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public string Play(string userId)
        {
            var player1 = UserService.GetUser(userId);
            var player2 = UserService.GetFreeUser();
            if (player1 != null && player2 != null)
            {
                player1.Status = UserStatus.Playing;
                player2.Status = UserStatus.Playing;
                var duel = DuelService.AddDuel(player1, player2);
                return duel.Id;
            }
            return string.Empty;
        }
    }
}