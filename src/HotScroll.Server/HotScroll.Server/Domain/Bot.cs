using System;
using System.Timers;

namespace HotScroll.Server.Domain
{
    public class Bot : Player
    {
        #region Constants

        public int Speed = 70;

        #endregion

        protected Timer GameTimer { get; set; }
        protected Object ThreadLock { get; set; }
        protected Player Opponent { get; set; }
        protected bool IsPlaying { get; set; }
        protected int Points { get; set; }

        public Bot(Player opponent, string connectionId, string name) :base (connectionId, name)
        {
            Opponent = opponent;
            ThreadLock = new object();
            GameTimer = new Timer(Speed);
            GameTimer.Elapsed += OnGameTimerElapsed;
        }

        public void Play()
        {
            lock (ThreadLock)
            {
                if (!IsPlaying)
                {
                    Stop();
                    IsPlaying = true;
                    GameTimer.Start();
                }
            }
        }

        public void Stop()
        {
            lock (ThreadLock)
            {
                Points = 0;
                IsPlaying = false;
                GameTimer.Stop();
            }
        }

        protected void OnGameTimerElapsed(object sender, ElapsedEventArgs e)
        {
            Game.Instance.RecordStep(ConnectionId, new Step{PlayerId = ConnectionId, Points = ++Points});
        }

    }
}