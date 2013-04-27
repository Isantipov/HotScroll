using System;

namespace HotScroll.Server.Domain
{
    public class LevelEvent
    {
        #region Constants

        protected const int MaximumDuration = 300;
        protected const int MinimumDuration = 50;

        #endregion

        public int Score { get; set; }
        public EventType Type { get; set; }
        public int Duration { get; set; }

        public LevelEvent()
        {
            Type = EventType.LeftDistractor;
        }

        public void GenerateRandom()
        {
            var random = new Random();
            Duration = random.Next(MinimumDuration, MaximumDuration);
            var maxEvent = Enum.GetNames(typeof (EventType)).Length;
            Type = (EventType) random.Next(1, maxEvent);
        }
    }

    public enum EventType
    {
        LeftDistractor  = 1,

        //RightDistractor = 2,
        //MegaDistractor = 3,
    }
}