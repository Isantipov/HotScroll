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

        public DuelProjection WaitPartner(User user)
        {
            var serverUser = UserService.GetUser(user.Id);
            serverUser.Status = UserStatus.WaitingForPartner;
            var oponent = UserService.GetFreeUser(serverUser);
            
            if (oponent != null)
            {
                serverUser.Status = oponent.Status = UserStatus.Playing;
                var duel = DuelService.AddDuel(serverUser, oponent);

                var proj1 = duel.ToProjection(serverUser.Id);
                Clients.Client(serverUser.ConnectionId).play(proj1);

                var proj2 = duel.ToProjection(oponent.Id);
                Clients.Client(oponent.ConnectionId).play(proj2);
                return proj1;
            }

            return null;
        }

        /// <summary>
        /// Returns duel Id
        /// </summary>
        /// <param name="step"></param>
        /// <returns></returns>
        public void RecordStep(Step step)
        {
            var user = UserService.GetUser(step.UserId);
            var duel = DuelService.GetDuelForUser(user.Id);
            if (duel.IsGameOver)
            {
                return;
            }

            var opponent = duel.GetOpponent(user.Id);
            Clients.Client(opponent.ConnectionId).receiveStep(step);

            if (DuelService.IsGameOver(step))
            {
                duel.IsGameOver = true;

                Clients.Client(opponent.ConnectionId).gameOver(false);
                Clients.Caller.gameOver(true);
                user.Status = UserStatus.Pending;
                opponent.Status = UserStatus.Pending;
            }
        }
    }
}