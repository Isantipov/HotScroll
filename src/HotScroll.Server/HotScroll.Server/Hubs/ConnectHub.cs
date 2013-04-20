﻿using HotScroll.Server.Domain;
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
            return string.Empty;
        }
    }
}