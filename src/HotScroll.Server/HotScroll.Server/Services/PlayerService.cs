using System.Collections.Concurrent;
using System.Globalization;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public class PlayerService
    {
        #region Constants

        private const string DefaultPlayerName = "Player";

        #endregion

        private ConcurrentDictionary<string, Player> _players;

        protected string GetNewPlayerName()
        {
            return DefaultPlayerName + (_players.Count + 1).ToString(CultureInfo.InvariantCulture);
        }

        public PlayerService()
        {
            _players = new ConcurrentDictionary<string, Player>();
        }

        public Player New(string connectionId)
        {
            var player = new Player(connectionId, GetNewPlayerName());
            Add(player);
            return player;
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
            return _players.ContainsKey(connectionId) ? _players[connectionId] : null;
        }

        public Player GetFreePlayer(Player currentPlayer)
        {
            return _players.Values.FirstOrDefault(t => t.Status == PlayerStatus.WaitingForPartner
                                                     && t.ConnectionId != currentPlayer.ConnectionId);
        }
    }
}