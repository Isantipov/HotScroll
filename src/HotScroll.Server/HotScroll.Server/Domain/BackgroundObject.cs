using System;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class BackgroundObject
    {
        #region Constants

        protected const int MaximumOffset = 1000;
        protected const int MaximumType = 7;

        #endregion

        public int Type { get; set; }
        public int Offset { get; set; }


        public void GenerateRandom(Random random)
        {
            Offset = random.Next(0, MaximumOffset);
            Type = random.Next(1, MaximumType + 1);
        }
    }
}