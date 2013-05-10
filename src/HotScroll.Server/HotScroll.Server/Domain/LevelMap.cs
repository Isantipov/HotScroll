using System;
using System.Collections.Generic;
using System.Linq;

namespace HotScroll.Server.Domain
{
    public class LevelMap
    {
        #region Constants

        // Tiles
        protected const int BackgoundsNumber = 150;

        // Events
        protected const int EventsNumber = 7;

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
            Background.Clear();
            for (var i = 0; i < BackgoundsNumber; i++)
            {
                var bg = new BgItem();
                do
                {
                    bg.GenerateRandom(random);
                } while (false);
                Background.Add(bg);
            }

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