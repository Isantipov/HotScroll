using System;
using System.Timers;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Player
    {
        private PlayerStatus _status = PlayerStatus.Pending;

        public string Name { get; set; }

        public string ConnectionId { get; set; }

        [JsonIgnore]
        protected Timer WaitPartnerTimer { get; set; }

        public event EventHandler<PlayerEventArgs> PartnerWaitTimerElapsed; 

        [JsonIgnore]
        public int Score { get; set; }

        [JsonIgnore]
        public PlayerStatus Status
        {
            get { return _status; }
            set { _status = value; }
        }

        public Player(string connectionId, string name)
        {
            ConnectionId = connectionId;
            Name = name;
            WaitPartnerTimer = new Timer();
            WaitPartnerTimer.Elapsed += OnWaitPartnerTimerElapsed;
        }

        public void StartWaitingPartner(int waitPartnerTimeout)
        {
            StopWaitingPartner();
            WaitPartnerTimer.Interval = waitPartnerTimeout;
            WaitPartnerTimer.Start();
        }

        public void StopWaitingPartner()
        {
            WaitPartnerTimer.Stop();
        }

        protected void OnWaitPartnerTimerElapsed(object sender, EventArgs eventArgs)
        {
            FirePartnerWaitTimerElepsed();
        }

        protected void FirePartnerWaitTimerElepsed()
        {
            var handler = PartnerWaitTimerElapsed;
            if (handler != null)
            {
                handler(this, new PlayerEventArgs(this));
            }
        }
    }

    public class PlayerEventArgs : EventArgs
    {
        public Player Player { get; set; }
        public PlayerEventArgs(Player player) : base()
        {
            Player = player;
        }
    }
}