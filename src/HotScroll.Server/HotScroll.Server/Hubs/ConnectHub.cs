﻿using System;
using System.Collections.Generic;
using HotScroll.Server.Domain;
using Microsoft.AspNet.SignalR;

namespace HotScroll.Server.Hubs
{
    /// <summary>
    ///     Manage connections.
    /// </summary>
    public class ConnectHub : Hub
    {
        private static readonly List<User> UsersInternal = new List<User>();

        public static List<User> Users
        {
            get { return UsersInternal; }
        }

        public User Connect(User user)
        {
            user.Id = Guid.NewGuid().ToString();

            UsersInternal.Add(user);
            Clients.All.userConnected(user);

            return user;
        }
    }
}