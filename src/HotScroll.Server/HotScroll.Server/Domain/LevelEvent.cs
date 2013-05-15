using System;
using System.Collections.Generic;

namespace HotScroll.Server.Domain
{
    public class LevelEvent
    {
        #region Constants
        protected const int MinimumDeltaScore = 20;
        protected const int MaximumDeltaScore = 150;

        protected const int MaximumDuration = 0;
        protected const int MinimumDuration = 0;

        #endregion

        public int Score { get; set; }
        public EventType Type { get; set; }
        public int Duration { get; set; }

        private static readonly int MaximumEventNumberHidden = Enum.GetNames(typeof (EventType)).Length;

        protected static int ExclusiveUpperBoundForEventNumber
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

        public static List<LevelEvent> GenerateRandomList(Random random, int minScore, int maxScrore)
        {
            var list = new List<LevelEvent>();
            var lastItem = new LevelEvent{Score = minScore};
            do
            {
                var score = random.Next(MinimumDeltaScore, MaximumDeltaScore + 1) + lastItem.Score;
                var type = (EventType)random.Next(1, ExclusiveUpperBoundForEventNumber);
                var duration = random.Next(MinimumDuration, MaximumDuration);
                lastItem = new LevelEvent { Type = type, Score = score, Duration = duration};
                list.Add(lastItem);
            } while (lastItem.Score <= maxScrore);
            return list;
        }
    }

    public enum EventType
    {
        LeftDistractor  = 1,
        //RightDistractor = 2,
        //MegaDistractor = 3,
    }
}