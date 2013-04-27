using System;
using System.Collections.Generic;

namespace HotScroll.Server.Domain
{
    public class LevelMap
    {
        #region Constants

        // Tiles
        protected const int UniqueTilesNumber = 5;
        protected const int TilesNumber = 15;

        // Events
        protected const int EventsNumber = 7;

        #endregion

        public List<int> Background { get; set; }

        public List<LevelEvent> Events { get; set; }

        public LevelMap()
        {
            Background = new List<int>();
            Events = new List<LevelEvent>();
        }

        public void GenerateRandom(Random random)
        {
            // Background
            Background.Clear();
            var prev = 0;
            var current = 0;
            for(var i = 0; i < TilesNumber; i++)
            {
                while (prev == current)
                {
                    current = random.Next(1, UniqueTilesNumber);
                }
                Background.Add(current);
                prev = current;
            }

            // Events
            Events.Clear();
            for(var i = 0; i < EventsNumber; i++)
            {
                var evnt = new LevelEvent();
                evnt.GenerateRandom(random);
                Events.Add(evnt);
            }
        }
    }
}