using System.Collections.Concurrent;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public class PlayerService
    {
        private ConcurrentDictionary<string, Player> _players;

        public PlayerService()
        {
            _players = new ConcurrentDictionary<string, Player>();
        }

        public void Add(Player player)
        {
            _players.TryAdd(player.ConnectionId, player);
        }


        public void Remove(Player player)
        {
            Player p;
            _players.TryRemove(player.ConnectionId, out p);
        }

        public Player Get(string connectionId)
        {
            return _players[connectionId];
        }

        public Player GetFreePlayer(Player currentPlayer)
        {
            return _players.Values.FirstOrDefault(t => t.Status == PlayerStatus.WaitingForPartner
                                                     && t.ConnectionId != currentPlayer.ConnectionId);
        }
    }
}