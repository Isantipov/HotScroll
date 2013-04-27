using System;
using System.Collections.Generic;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public static class UserService
    {
        private static readonly List<Player> UsersInternal = new List<Player>();

        public static List<Player> Users
        {
            get { return UsersInternal; }
        }

        public static void AddUser(Player user)
        {
            user.Id = Guid.NewGuid().ToString();

            UsersInternal.Add(user);
        }

        public static Player GetUser(string id)
        {
            return UsersInternal.FirstOrDefault(t => t.Id == id);
        }

        public static Player GetFreeUser(Player currentUser)
        {
            return UsersInternal.FirstOrDefault(t => t.Status == UserStatus.WaitingForPartner
                                                     && t.Id != currentUser.Id);
        }
    }
}