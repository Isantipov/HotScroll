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
        protected const int EventsNumber = 10;

        #endregion

        public List<int> Background { get; set; }

        public List<LevelEvent> Events { get; set; }

        public LevelMap()
        {
            Background = new List<int>();
            Events = new List<LevelEvent>();
        }

        protected void GenerateRandom()
        {
            // Background
            Background.Clear();
            var random = new Random();
            for(var i = 0; i < TilesNumber; i++)
            {
                Background.Add(random.Next(1, UniqueTilesNumber));
            }

            // Events
            Events.Clear();
            for(var i = 0; i < EventsNumber; i++)
            {
                var evnt = new LevelEvent();
                evnt.GenerateRandom();
                Events.Add(evnt);
            }
        }
    }
}