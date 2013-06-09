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
        protected const int BackgroundStart = -50;

        // Events
        protected const int EventsMinScore = 100;
        protected const int EventsMaxScore = 950;

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
            Background = BgItem.GenerateRandomList(random, BackgroundStart, BackgroundMaxSize);

            // Events
            Events = LevelEvent.GenerateRandomList(random, EventsMinScore, EventsMaxScore);
        }

        public LevelMap Clone()
        {
            var map = new LevelMap {Background = new List<BgItem>(), Events = new List<LevelEvent>()};
            foreach (var bgItem in Background)
            {
                map.Background.Add(bgItem.Clone());
            }
            foreach (var levelEvent in Events)
            {
                map.Events.Add(levelEvent.Clone());
            }
            return map;
        }
    }
}