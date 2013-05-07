using System.Collections.Concurrent;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public class DuelService
    {
        private ConcurrentDictionary<string, Duel> _duels = new ConcurrentDictionary<string, Duel>();
        
        public DuelService()
        {
            _duels = new ConcurrentDictionary<string, Duel>();
        }

        public void Add(Duel duel)
        {
            _duels.TryAdd(duel.Id, duel);
        }

        public Duel Get(string id)
        {
            return _duels[id];
        }

        public Duel GetDuelForPLayer(string playerId)
        {
            return _duels.Values.FirstOrDefault(t => !t.IsGameOver && t.Players.Any(p => p.ConnectionId == playerId));
        }

        /// <summary>
        ///     Sets <see cref="Duel.IsGameOver" /> to true
        ///     and removes duel from the internal storage
        ///     to prevent memory leaks.
        /// </summary>
        /// <param name="duel">Duel to be finished and removed.</param>
        public void FinishAndRemove(Duel duel)
        {
            duel.IsGameOver = true;
            Duel d;
            _duels.TryRemove(duel.Id, out d);
        }
    }
}