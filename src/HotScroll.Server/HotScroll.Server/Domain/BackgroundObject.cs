using System;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class BackgroundObject
    {
        #region Constants

        protected const int MaximumOffset = 1000;

        #endregion

        public BackgroundType Type { get; set; }
        public int Offset { get; set; }

        [JsonIgnore]
        public int LeftBorder { get; private set; }
        public int RightBorder { get; private set; }

        private static readonly int MaximumBackgroundNumberHidden = Enum.GetNames(typeof(BackgroundType)).Length;
        protected int MaximumBackgroundNumber { get { return MaximumBackgroundNumberHidden; } }

        public void GenerateRandom(Random random)
        {
            Offset = random.Next(0, MaximumOffset);
            Type = (BackgroundType) random.Next(1, MaximumBackgroundNumber);
        }
    }
}