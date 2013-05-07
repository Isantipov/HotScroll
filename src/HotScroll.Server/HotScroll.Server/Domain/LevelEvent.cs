using System;

namespace HotScroll.Server.Domain
{
    public class LevelEvent
    {
        #region Constants

        protected const int MaximumScore = 1000;
        protected const int MinimumScore = 50;

        protected const int MaximumDuration = 150;
        protected const int MinimumDuration = 50;

        #endregion

        public int Score { get; set; }
        public EventType Type { get; set; }
        public int Duration { get; set; }

        private static readonly int MaximumEventNumberHidden = Enum.GetNames(typeof(EventType)).Length;
        protected int MaximumEventNumber { get { return MaximumEventNumberHidden; } }

        public LevelEvent()
        {
            Type = EventType.LeftDistractor;
        }

        public void GenerateRandom(Random random)
        {
            Duration = random.Next(MinimumDuration, MaximumDuration);
            Score = random.Next(MinimumScore, MaximumScore);
            Type = (EventType)random.Next(1, MaximumEventNumber);
        }
    }

    public enum EventType
    {
        LeftDistractor  = 1,

        //RightDistractor = 2,
        //MegaDistractor = 3,
    }
}