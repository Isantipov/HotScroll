using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class BgItem
    {
        #region Constants

        protected const int MaximumInnerOffset = 10;
        protected const int MinimumInnerOffset = 5;

        protected const int MaximumPatternOffset = 35;
        protected const int MinimumPatternOffset = 20;

        #endregion

        [JsonIgnore]
        public BgItemType Type { get; set; }

        public string Code { get; set; }
        public int Offset { get; set; }

        public static List<BgItemType> BgItemTypes = new List<BgItemType>
            {
                new BgItemType{Code = "start", Name = "Start", IsOverlapping = true, IsReplicable = false},
                new BgItemType{Code = "small_tree", Name = "Small Tree", IsOverlapping = true, IsReplicable = true, WidthPx = 235},
                new BgItemType{Code = "big_tree", Name = "Big Tree", IsOverlapping = true, IsReplicable = true, WidthPx = 337},
                new BgItemType{Code = "bush", Name = "Bush", IsOverlapping = true, IsReplicable = true, WidthPx = 195},
                new BgItemType{Code = "bench", Name = "Bench", IsOverlapping = false, IsReplicable = false, WidthPx = 341},
                new BgItemType{Code = "fireplug", Name = "Fireplug", IsOverlapping = false, IsReplicable = false, WidthPx = 89},
                new BgItemType{Code = "purple_flower", Name = "Purple Flower", IsOverlapping = false, IsReplicable = true, WidthPx = 53},
                new BgItemType{Code = "yellow_flower", Name = "Yellow Flower", IsOverlapping = false, IsReplicable = true, WidthPx = 53},
                new BgItemType{Code = "finish", Name = "Finish", IsOverlapping = true, IsReplicable = false},
            };

        public static List<List<string>> BgPatterns = new List<List<string>>
            {
                new List<String>{"bush","small_tree","big_tree","small_tree"},
                new List<String>{"small_tree","big_tree","small_tree"},
                new List<String>{"small_tree","big_tree","bush"},
                new List<String>{"big_tree","bush","small_tree"},
                new List<String>{"bush","big_tree","small_tree"},
                new List<String>{"bush","small_tree","bush"},
                new List<String>{"big_tree","bush","small_tree"},
                new List<String>{"purple_flower","bench","yellow_flower"},
                new List<String>{"yellow_flower","bench","purple_flower"},
                new List<String>{"small_tree","bench","yellow_flower"},
                new List<String>{"yellow_flower","bench","big_tree"},
                new List<String>{"purple_flower","fireplug","yellow_flower"},
                new List<String>{"yellow_flower","fireplug","purple_flower"},
                new List<String>{"bench"},
                new List<String>{"bush"},
                new List<String>{"big_tree"},
                new List<String>{"small_tree"},
                new List<String>{"fireplug"},
                new List<String>{"purple_flower"},
                new List<String>{"yellow_flower"},

            };

        public static List<BgItem> GenerateRandomList(Random random, int start, int maxSize)
        {
            var list = new List<BgItem>();
            var lastItem = new BgItem{Code = "start", Offset = start};
            list.Add(lastItem);
            do
            {
                var pOffset = random.Next(MinimumPatternOffset, MaximumPatternOffset + 1);
                var pattern = BgPatterns[random.Next(0, BgPatterns.Count)];
                lastItem = new BgItem {Code = pattern[0], Offset = lastItem.Offset + pOffset};
                list.Add(lastItem);
                foreach (var bgType in pattern.Skip(1))
                {
                    var iOffset = random.Next(MinimumInnerOffset, MaximumInnerOffset + 1);
                    lastItem = new BgItem { Code = bgType, Offset = lastItem.Offset + iOffset };
                    list.Add(lastItem);
                }
            } while (lastItem.Offset <= maxSize);
            lastItem = new BgItem { Code = "finish", Offset = LevelMap.MaximumScore };
            list.Add(lastItem);
            return list;
        }

        public BgItem Clone()
        {
            return (BgItem)MemberwiseClone();
        }
    }
}