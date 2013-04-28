using System;
using System.Collections.Generic;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public static class PlayerService
    {
        private static readonly List<Player> PlayersInternal = new List<Player>();

        public static List<Player> Players
        {
            get { return PlayersInternal; }
        }

        public static void Add(Player player)
        {
            player.Id = Guid.NewGuid().ToString();

            PlayersInternal.Add(player);
        }

        public static Player Get(string id)
        {
            return PlayersInternal.FirstOrDefault(t => t.Id == id);
        }

        public static Player GetFreePlayer(Player currentPlayer)
        {
            return PlayersInternal.FirstOrDefault(t => t.Status == PlayerStatus.WaitingForPartner
                                                     && t.Id != currentPlayer.Id);
        }

        public static Player GetByConnectionId(string connectionId)
        {
            return PlayersInternal.FirstOrDefault(t => t.ConnectionId == connectionId);
        }
    }
}