using System;
using System.Collections.Generic;
using System.Linq;

namespace HotScroll.Server.Domain
{
    public class LevelMap
    {
        #region Constants

        public const int MaximumScore = 1000;
        // Bg Items
        protected const int BackgroundMaxSize = 1010;

        // Events
        protected const int EventsNumber = 5;

        #endregion

        public List<BgItem> Background { get; set; }

        public List<LevelEvent> Events { get; set; }

        public LevelMap()
        {
            Background = new List<BgItem>();
            Events = new List<LevelEvent>();
        }

        public void GenerateRandom(Random random)
        {
            // Background
            Background = BgItem.GenerateRandomList(random, BackgroundMaxSize);

            // Events
            Events.Clear();
            for(var i = 0; i < EventsNumber; i++)
            {
                LevelEvent evnt = null;
                do
                {
                    evnt = new LevelEvent();
                    evnt.GenerateRandom(random);
                } while (Events.Any(t => (t.Score <= evnt.Score && evnt.Score <= t.Score + t.Duration) ||
                    (t.Score <= evnt.Score + evnt.Duration && evnt.Score + evnt.Duration <= t.Score + t.Duration)));
                
                Events.Add(evnt);
            }
            Events = Events.OrderBy(t => t.Score).ToList();
        }
    }
}