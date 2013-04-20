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
            var oponent = UserService.GetFreeUser(user);
            
            if (oponent != null)
            {
                user.Status = oponent.Status = UserStatus.Playing;
                var duel = DuelService.AddDuel(user, oponent);

                var proj1 = duel.ToProjection(user.Id);
                Clients.Caller.play(proj1);

                var proj2 = duel.ToProjection(oponent.Id);
                Clients.Client(oponent.ConnectionId).play(proj2);
            }
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
            var opponent = duel.GetOpponent(user.Id);
            Clients.Client(opponent.ConnectionId).receiveStep(step);
        }
    }
}