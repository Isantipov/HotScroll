using System;

namespace HotScroll.Server.Domain
{
    public class LevelEvent
    {
        #region Constants
        protected const int MinimumScore = 50;

        protected const int MaximumDuration = 0;
        protected const int MinimumDuration = 0;

        #endregion

        public int Score { get; set; }
        public EventType Type { get; set; }
        public int Duration { get; set; }

        private static readonly int MaximumEventNumberHidden = Enum.GetNames(typeof (EventType)).Length;

        protected int ExclusiveUpperBoundForEventNumber
        {
            get { return MaximumEventNumberHidden + 1; }
        }

        private int MaximumScore
        {
            get { return LevelMap.MaximumScore; }
        }


        public LevelEvent()
        {
            Type = EventType.LeftDistractor;
        }

        public void GenerateRandom(Random random)
        {
            Duration = random.Next(MinimumDuration, MaximumDuration);
            Score = random.Next(MinimumScore, MaximumScore);
            Type = (EventType)random.Next(1, ExclusiveUpperBoundForEventNumber);
        }
    }

    public enum EventType
    {
        LeftDistractor  = 1,
        RightDistractor = 2,
        //MegaDistractor = 3,
    }
}