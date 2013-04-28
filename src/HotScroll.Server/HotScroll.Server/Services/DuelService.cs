using System.Collections.Generic;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public class DuelService
    {
        private static readonly List<Duel> DuelsInternal = new List<Duel>();

        public static List<Duel> Duels
        {
            get { return DuelsInternal; }
        }

        public static Duel AddDuel(List<Player> players)
        {
            var duel = new Duel(players);
            DuelsInternal.Add(duel);
            return duel;
        }

        public static Duel GetDuel(string id)
        {
            return DuelsInternal.FirstOrDefault(t => t.Id == id);
        }

        public static Duel GetDuelForPLayer(string playerId)
        {
            return DuelsInternal.FirstOrDefault(t => !t.IsGameOver && t.Players.Any(p => p.Id == playerId));
        }
    }
}