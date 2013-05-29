using System;
using System.Timers;

namespace HotScroll.Server.Domain
{
    public class Bot : Player
    {
        #region Constants

        public const int MinSpeed = 40;
        public const int MaxSpeed = 120;
        
        public const int MinImpulse = 1;
        public const int MaxImpulse = 3;
        
        #endregion

        protected Timer GameTimer { get; set; }
        protected Object ThreadLock { get; set; }
        protected Player Opponent { get; set; }
        protected bool IsPlaying { get; set; }
        protected int Points { get; set; }
        protected int Speed { get; set; }

        private readonly Game game;

        public Bot(Player opponent, string connectionId, string name) :base (connectionId, name)
        {
            game = Game.Instance;
            Speed = MinSpeed;
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
            var dir = game.Random.Next(-1, 2); /* 1 is max */
            var imp = game.Random.Next(MinImpulse, MaxImpulse + 1);
            Speed += dir*imp;
            if (Speed < MinSpeed)
            {
                Speed = MinSpeed;
            }
            if (Speed > MaxSpeed)
            {
                Speed = MaxSpeed;
            }
            GameTimer.Interval = Speed;
            game.RecordStep(ConnectionId, new Step{PlayerId = ConnectionId, Points = ++Points});
        }

    }
}