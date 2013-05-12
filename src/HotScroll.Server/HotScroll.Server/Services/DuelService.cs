using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
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
            Duel duel;
            duelsStorage.TryGetValue(id, out duel);

            return duel;
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

        /// <summary>
        ///     Gets a new <see cref="Duel" /> object which allows same
        ///     players, who played an old <see cref="Duel" /> with id = <paramref name="duelToRetryId" />
        ///     to play with each other again.
        /// </summary>
        /// <param name="duelToRetryId">
        ///     An id of <see cref="Duel" /> to be retried.
        /// </param>
        /// <returns>
        ///     a new <see cref="Duel" /> object which allows same
        ///     players, who played an old <see cref="Duel" /> with id = <paramref name="duelToRetryId" />
        ///     to play with each other again.
        /// </returns>
        [MethodImpl(MethodImplOptions.Synchronized)]
        public Duel GetRetryDuel(string duelToRetryId)
        {
            Duel retryDuel = duelsStorage.FirstOrDefault(i => i.Value.RetriedDuelId == duelToRetryId).Value;

            if (retryDuel != null)
            {
                return retryDuel;
            }

            retryDuel = new Duel(new List<Player>(), duelToRetryId);
            Add(retryDuel);

            return retryDuel;
        }
    }
}