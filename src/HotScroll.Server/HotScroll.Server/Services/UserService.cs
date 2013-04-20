using System;
using System.Collections.Generic;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public static class UserService
    {
        private static readonly List<User> UsersInternal = new List<User>();

        public static List<User> Users
        {
            get { return UsersInternal; }
        }

        public static void AddUser(User user)
        {
            user.Id = Guid.NewGuid().ToString();

            UsersInternal.Add(user);
        }
    }
}