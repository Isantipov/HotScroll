using System.Collections.Concurrent;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public class DuelService
    {
        private readonly ConcurrentDictionary<string, Duel> duelsStorage = new ConcurrentDictionary<string, Duel>();

        public DuelService()
        {
            duelsStorage = new ConcurrentDictionary<string, Duel>();
        }

        public void Add(Duel duel)
        {
            duelsStorage.TryAdd(duel.Id, duel);
        }

        public Duel Get(string id)
        {
            return duelsStorage.ContainsKey(id) ? duelsStorage[id] : null;
        }

        public Duel GetDuelForPLayer(string playerId)
        {
            return
                duelsStorage.Values.FirstOrDefault(t => !t.IsGameOver && t.Players.Any(p => p.Player.ConnectionId == playerId));
        }

        /// <summary>
        ///     Sets <see cref="Duel.IsGameOver" /> to true
        ///     and removes duel from the internal storage
        ///     to prevent memory leaks.
        /// </summary>
        /// <param name="duel">Duel to be finished and removed.</param>
        public void FinishAndRemove(Duel duel)
        {
            duel.Status = DuelStatus.GameOver;
            Duel d;
            duelsStorage.TryRemove(duel.Id, out d);
        }
    }
}