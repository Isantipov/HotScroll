using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class BgItem
    {
        #region Constants

        protected const int MaximumOffset = 1000;

        #endregion

        public BgItemType Type { get; set; }
        public string Code { get; set; }
        public int Offset { get; set; }

        public static List<BgItemType> BgItemTypes = new List<BgItemType>
            {
                new BgItemType{Code = "small_tree", Name = "Small Tree", IsOverlapping = true, IsReplicable = true, WidthPx = 235},
                new BgItemType{Code = "big_tree", Name = "Big Tree", IsOverlapping = true, IsReplicable = true, WidthPx = 337},
                new BgItemType{Code = "bush", Name = "Bush", IsOverlapping = true, IsReplicable = true, WidthPx = 195},
                new BgItemType{Code = "bench", Name = "Bench", IsOverlapping = false, IsReplicable = false, WidthPx = 341},
                new BgItemType{Code = "fireplug", Name = "Fireplug", IsOverlapping = false, IsReplicable = false, WidthPx = 89},
                new BgItemType{Code = "purple_flower", Name = "Purple Flower", IsOverlapping = false, IsReplicable = true, WidthPx = 53},
                new BgItemType{Code = "yellow_flower", Name = "Yellow Flower", IsOverlapping = false, IsReplicable = true, WidthPx = 53},
            };

        public void GenerateRandom(Random random)
        {
            Offset = random.Next(0, MaximumOffset);
            Type = BgItemTypes[random.Next(0, BgItemTypes.Count)];
        }
    }
}