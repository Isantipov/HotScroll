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
            user.ConnectionId = Context.ConnectionId;
            UserService.AddUser(user);
            Clients.All.userConnected(user);
            return user;
        }

        public void WaitPartner(User user)
        {
            var oponent = UserService.GetFreeUser();
            
            if (oponent != null)
            {
                user.Status = oponent.Status = UserStatus.Playing;
                
                var duel = DuelService.AddDuel(user, oponent);

                var proj1 = duel.ToProjection(user.Id);
                Clients.Client(oponent.ConnectionId).play(proj1);

                var proj2 = duel.ToProjection(oponent.Id);
                Clients.Caller.play(proj2);
            }
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