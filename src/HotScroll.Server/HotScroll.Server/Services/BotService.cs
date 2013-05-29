using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public class BotService
    {
        #region Constants

        private const int MaxNumberOfBots = 5;

        #endregion

        protected Random Random { get; set; }

        protected List<string> BotNames = new List<string>
            {
                "2ooom",
                "Isantipov",
                "yleichanok",
                "Graffinchik",
                "alex_skakun",
            };

        private readonly ConcurrentDictionary<string, Bot> botsStorage;

        public BotService(Random rand)
        {
            Random = rand;
            botsStorage = new ConcurrentDictionary<string, Bot>();
        }

        public Bot AddForPlayer(Player opponent)
        {
            if (botsStorage.Count >= MaxNumberOfBots)
            {
                return null;
            }
            var id = Guid.NewGuid().ToString();
            var name = BotNames[Random.Next(0, BotNames.Count)];
            var bot = new Bot(opponent, id, name);
            bot.Initialize();
            botsStorage.TryAdd(id, bot);
            return bot;
        }

        public void Remove(Bot player)
        {
            if (botsStorage.ContainsKey(player.ConnectionId))
            {
                Bot p;
                botsStorage.TryRemove(player.ConnectionId, out p);
                p.Stop();
            }
        }
    }
}